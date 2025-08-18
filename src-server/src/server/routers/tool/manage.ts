import {Elysia, t} from "elysia";
import {aiToolContentDao, aiToolDao} from "@/dao";
import {Result} from "@/views/Result";
import {beginTransactional} from "@/utils/SqlUtil";

export default new Elysia({prefix: '/manage'})
  // 工具列表
  .get('list', async () => {
    const list = await aiToolDao.query().list();
    return Result.success(list.map(e => ({
      ...e,
      tags: e.tags.split(',')
    })));
  })
  // 工具详情
  .get('info/:id',
    async ({params}) => {
      const {id} = params;
      const row = await aiToolDao.selectById(id);
      if (!row) {
        return Result.fail('文件未找到');
      }
      const content = await aiToolContentDao.query().eq('tool_id', id).one();
      return Result.success({
        ...row,
        tags: row.tags.split(','),
        content: content?.content || '',
      });
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    })
  // 新增工具
  .post('/add',
    async ({body}) => {
      await beginTransactional(async () => {
        const now = Date.now();
        // 新增工具
        const {id} = await aiToolDao.insert({
          title: body.title,
          description: body.description,
          icon: body.icon,
          tags: body.tags.join(','),
          is_liked: 0,
          run_count: 0,
          created_at: now,
          updated_at: now,
        });
        // 新增内容
        await aiToolContentDao.insert({
          tool_id: id,
          content: body.content,
        })
      });
      return Result.success();
    },
    {
      body: t.Object({
        title: t.String(),
        description: t.String(),
        icon: t.String(),
        tags: t.Array(t.String()),
        content: t.String(),
      }),
    })
  // 修改工具
  .put('/update/:id',
    async ({params, body}) => {
      const {id} = params;
      await beginTransactional(async () => {
        const now = Date.now();
        // 修改工具
        await aiToolDao.updateById(id, {
          title: body.title,
          description: body.description,
          icon: body.icon,
          tags: body.tags.join(','),
          is_liked: 0,
          run_count: 0,
          updated_at: now,
        });
        // 修改内容
        const c = await aiToolContentDao.query().eq('tool_id', id).one();
        if (c) {
          await aiToolContentDao.updateById(c.id, {
            content: body.content,
          });
        } else {
          await aiToolContentDao.insert({
            tool_id: id,
            content: body.content,
          })
        }
      });
      return Result.success();
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        title: t.String(),
        description: t.String(),
        icon: t.String(),
        tags: t.Array(t.String()),
        content: t.String(),
      }),
    })
  // 删除工具
  .delete('/delete/:id',
    async ({params}) => {
      const {id} = params;
      await beginTransactional(async () => {
        await aiToolDao.deleteById(id);
        await aiToolContentDao.query().eq('tool_id', id).delete();
      })
      return Result.success();
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    })
  // 预览
  .get('/preview/:id',
    async ({params, set}) => {
      const {id} = params;

      const content = await aiToolContentDao.query().eq('tool_id', id.replace(/.html$/, '')).one();
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