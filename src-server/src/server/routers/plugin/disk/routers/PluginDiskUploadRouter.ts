import {Elysia, t} from "elysia";
import {Result} from "@/views/Result";
import {pluginDiskUploadService} from "@/service/plugin/disk/PluginDiskUploadService";

export default new Elysia()
  .post('/upload/:id', async ({request, params, headers}) => {
    const asTask = await pluginDiskUploadService(request, params, headers);
    return Result.success(asTask);
  }, {
    params: t.Object({
      id: t.String(),
    }),
    headers: t.Record(t.String(), t.Any())
  })