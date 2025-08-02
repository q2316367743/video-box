import {Elysia, t} from "elysia";
import {sourceDiskDao} from "@/dao";
import {Result} from "@/views/Result";
import {pluginDiskGet} from "@/service/plugin/disk";

export default new Elysia()
  .post(
    'get/:id',
    async ({params, body}) => {
      const {id} = params;
      const {path, password} = body;
      const plugin = await sourceDiskDao.getPlugin(id);
      if (!plugin) {
        return Result.error("磁盘插件未找到");
      }
      const dir = await pluginDiskGet(path, plugin, id)
      if (!dir) {
        return new Result(404, "目录不存在");
      }
      return Result.success(dir);
    },
    {
      params: t.Object({
        id: t.String()
      }),
      body: t.Object({
        path: t.String(),
        password: t.String({
          default: ''
        })
      })
    })