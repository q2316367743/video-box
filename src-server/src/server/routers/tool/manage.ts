import {Elysia, t} from "elysia";
import {aiToolContentDao, aiToolDao} from "@/dao";
import {Result} from "@/views/Result";

export default new Elysia({prefix: '/manage'})
  // 工具列表
  .get('list', async () => {
    const list = await aiToolDao.query().list();
    return Result.success(list);
  })
  // 预览
  .get('preview/:id.html',
    async ({params, set}) => {
      const content = await aiToolContentDao.query().eq('tool_id', params.id).one();
      if (!content) {
        set.status = 404;
        return Result.fail('文件未找到');
      }

      return new Response(content.content, {
        status: 200,
        statusText: 'OK',
        headers: {
          'Content-Type': 'text/html; charset=utf-8'
        }
      })
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ['tool/chat'],
        summary: '预览一个会话',
        description: '预览一个会话',
      }
    });