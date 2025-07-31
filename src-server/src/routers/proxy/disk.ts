import {Elysia, t} from "elysia";
import {sourceDiskDao} from "@/dao";
import {Result} from "@/views/Result";

function renderHeaders(headers: Record<string, string | undefined>): Record<string, string> {
  return Object.entries(headers).reduce((acc, [key, value]) => {
    if (typeof value !== "undefined") {
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, string>);
}

export default new Elysia()
  .get('/disk/:id/p/*', async ({params, query, set, headers}) => {
    const {sign} = query;
    const {id} = params;
    const path = '/' + params['*'];
    // 这里 path 就是 /proxy/disk/p/ 后面的任意路径
    const plugin = await sourceDiskDao.getPlugin(id);
    if (!plugin) {
      set.status = 500;
      return Result.error("磁盘插件未找到");
    }
    return await plugin.readFile({path, sign}, {
      range: headers['Range'] || '0-'
    });
  }, {
    params: t.Object({
      id: t.String(),
      '*': t.String()
    }),
    query: t.Object({
      sign: t.String()
    })
  })