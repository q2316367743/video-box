import {Elysia, t} from "elysia";
import {sourceRandomContentDao, sourceRandomDao} from "@/dao";
import {Result} from "@/views/Result";
import {getRandomRecords} from "@/global/ScriptManage";

export default new Elysia({prefix: 'plugin/random'})
  .get('list', async () => {
    const list = await sourceRandomDao.query().list();
    return Result.success(list.map(e => ({
      ...e,
      tags: e.tags ? e.tags.split(',') : [],
    })));
  })
  .get('get/:id', async ({params, query}) => {
    const content = await sourceRandomContentDao.query().eq('random_id', params.id).one();
    if (!content) return Result.notFound();
    const records = await getRandomRecords(content.script, query.tag)
    return Result.success(records);
  }, {
    params: t.Object({
      id: t.String(),
    }),
    query: t.Object({
      tag: t.String({
        default: ''
      }),
    })
  })