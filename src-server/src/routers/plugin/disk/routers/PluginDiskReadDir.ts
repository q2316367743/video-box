import {Elysia, t} from "elysia";
import {sourceDiskDao} from "@/dao";
import {Result} from "@/views/Result";

export default new Elysia()
  .get('/read-dir/:id', async ({params, query}) => {
    const {id} = params;
    const {path} = query;
    const plugin = await sourceDiskDao.getPlugin(id);
    if (!plugin) return Result.error('源不存在');
    return Result.success(await plugin.readDir(path));
  }, {
    params: t.Object({
      id: t.String(),
    }),
    query: t.Object({
      path: t.String(),
    })
  })