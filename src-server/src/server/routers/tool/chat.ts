import {Elysia, t} from "elysia";
import {error} from '@rasla/logify';
import {aiToolMessageDao, aiToolSessionDao, sourceAiDao} from "@/dao";
import {Result} from "@/views/Result";
import {beginTransactional} from "@/utils/SqlUtil";
import {sendSse} from "@/utils/http/SseUtil";

export default new Elysia({prefix: '/chat'})
  // 获取全部的session
  .get('/list',
    async () => {
      const list = await aiToolSessionDao.query().orderByDesc('created_at').list();
      return Result.success(list);
    })
  // 创建一个session
  .post('/create',
    async ({body}) => {
      const {id} = await aiToolSessionDao.insert({
        title: body.title,
        ai_id: body.ai_id,
        ai_model: body.ai_model,
        created_at: Date.now(),
        updated_at: Date.now(),
      });
      return Result.success(id);
    },
    {
      body: t.Object({
        title: t.String(),
        ai_id: t.String(),
        ai_model: t.String(),
      })
    })
  // 获取一个session的全部聊天记录
  .get("/message/:id",
    async ({params}) => {
      const messages = await aiToolMessageDao.query()
        .eq('session_id', params.id)
        .orderByAsc('created_at')
        .list();
      return Result.success(messages);
    },
    {
      params: t.Object({
        id: t.String(),
      })
    })
  .delete('/delete/:id',
    async ({params}) => {
      const old = await aiToolSessionDao.selectById(params.id);
      if (!old) return Result.fail("会话未找到");
      await beginTransactional(async () => {
        // 删除自己
        await aiToolSessionDao.deleteById(params.id);
        // 删除消息
        await aiToolMessageDao.query().eq('session_id', params.id).delete();
      });
      return Result.success();
    },
    {
      params: t.Object({
        id: t.String(),
      })
    })
  // 聊天
  .get('/stream/:id',
    async ({params, query, set, request}) => {
      // 获取使用的ID
      const sourceAi = await sourceAiDao.selectById(query.ai_id);
      if (!sourceAi) {
        set.status = 404;
        return Result.error("AI源不存在");
      }
      // 插入新的聊天记录
      await aiToolMessageDao.insert({
        created_at: Date.now(),
        session_id: params.id,
        role: 'user',
        content: query.content,
      })
      // 获取历史聊天记录
      const messages = await aiToolMessageDao.query().eq('session_id', params.id).orderByAsc('created_at').list();

      const stream = new ReadableStream({
        async start(controller) {
          const {id} = await aiToolMessageDao.insert({
            created_at: Date.now(),
            session_id: params.id,
            role: 'assistant',
            content: '',
          });
          let messageContent = '';
          try {
            await sendSse({
              url: sourceAi.url + '/chat/completions',
              token: sourceAi.token,
              event: 'data',
              payload: {
                "model": query.ai_model,
                "messages": messages.map(e => ({
                  "role": e.role,
                  "content": e.content,
                })),
                "stream": true
              },
              callback: (chuck) => {
                try {
                  const content = chuck.choices?.[0]?.delta?.content || '';
                  if (content) {
                    controller.enqueue(`event: data\ndata: ${JSON.stringify({content})}\n\n`);
                    messageContent += content;
                    // 更新数据库
                    aiToolMessageDao.updateById(id, {
                      content: messageContent
                    })
                  }
                } catch(e) {
                  // 忽略解析失败的行
                  console.error(e);
                  error("解析 SSE 数据失败：" + JSON.stringify(chuck));
                }
              },
            });

            // 完成
            controller.enqueue(`event: complete\ndata: ${JSON.stringify({content: messageContent})}\n\n`);
            controller.close();
          } catch (e) {
            console.error(e);
            await aiToolMessageDao.deleteById(id);
          }

          request.signal.addEventListener('abort', () => {
            controller.close();
          });
        }
      });
      return new Response(stream, {
        status: 200,
        statusText: 'OK',
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        }
      })
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      query: t.Object({
        // 使用的AI的id
        ai_id: t.String(),
        // 使用的模型
        ai_model: t.String(),
        // 这次消息内容
        content: t.String()
      })
    })