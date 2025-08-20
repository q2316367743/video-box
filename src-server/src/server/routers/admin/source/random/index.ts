import {Elysia, t} from "elysia";
import {sourceRandomContentDao, sourceRandomDao} from "@/dao";
import {Result} from "@/views/Result";
import {beginTransactional} from "@/utils/SqlUtil";

export default new Elysia({prefix: '/source/random'})
  .get('list', async () => {
    const list = await sourceRandomDao.query().list();
    return Result.success(list.map(e => ({
      ...e,
      tags: e.tags ? e.tags.split(',') : [],
    })));
  })
  .get("info/:id", async ({params}) => {
    const info = await sourceRandomDao.selectById(params.id);
    if (!info) return Result.notFound();
    const content = await sourceRandomContentDao.query().eq('random_id', params.id).one();
    return Result.success({
      info,
      script: content?.script || '',
    });
  })
  .post("add",
    async ({body}) => {
      await beginTransactional(async () => {
        const {id} = await sourceRandomDao.insert({
          created_at: Date.now(),
          updated_at: Date.now(),
          icon: body.icon,
          name: body.name,
          description: body.description,
          tags: body.tags.join(','),
        });
        await sourceRandomContentDao.insert({
          random_id: id,
          script: body.script,
        });
      })
      return Result.success();
    },
    {
      body: t.Object({
        icon: t.String(),
        name: t.String(),
        description: t.String(),
        tags: t.Array(t.String()),
        script: t.String(),
      })
    })
  .put('update/:id',
    async ({body, params}) => {
      const old = await sourceRandomDao.selectById(params.id);
      if (!old) return Result.notFound();
      await beginTransactional(async () => {
        await sourceRandomDao.updateById(params.id, {
          updated_at: Date.now(),
          icon: body.icon,
          name: body.name,
          description: body.description,
          tags: body.tags.join(','),
        });
        const rc = await sourceRandomContentDao.query().eq('random_id', params.id).one();
        if (rc) {
          await sourceRandomContentDao.updateById(rc.id, {
            script: body.script,
          });
        } else {
          await sourceRandomContentDao.insert({
            random_id: params.id,
            script: body.script,
          });
        }
      })
      return Result.success();
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        icon: t.String(),
        name: t.String(),
        description: t.String(),
        tags: t.Array(t.String()),
        script: t.String(),
      })
    })
  .delete('delete/:id',
    async ({params}) => {
      await beginTransactional(async () => {
        await sourceRandomDao.deleteById(params.id);
        await sourceRandomContentDao.query().eq('random_id', params.id).delete();
      })
      return Result.success();
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    })