import {Elysia, t} from "elysia";
import {sourceDiskDao} from "@/dao";
import {Result} from "@/views/Result";

export default new Elysia()
  .get('link/:id', async ({params, query}) => {
    const {id} = params;
    const path = query.path;
    const plugin = await sourceDiskDao.getPlugin(id);
    if (!plugin) return Result.error("网盘不存在");
    return Result.success(await plugin.getFileDownloadLink(path));
  }, {
    params: t.Object({
      id: t.String(),
    }),
    query: t.Object({
      path: t.String(),
    })
  })