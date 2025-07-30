import {Elysia, t} from "elysia";
import {sourceDiskDao} from "@/dao";
import {Result} from "@/views/Result";

export default new Elysia()
  .delete('/delete/:id', async ({params}) => {
    const {id} = params;
    await sourceDiskDao.delete(id);
    return Result.success();
  }, {
    params: t.Object({
      id: t.String(),
    }),
  })