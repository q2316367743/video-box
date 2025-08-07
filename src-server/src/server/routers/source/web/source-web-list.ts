import {SourceWeb, SourceWebView} from "@/types/SourceWeb";
import {Result} from "@/views/Result";
import {Elysia, t} from "elysia";
import {sourceWebDao} from "@/dao";

const app = new Elysia();

/**
 * 查询列表
 * root-根目录
 * all-全部
 * 其他-指定目录
 */
app.get(
  "list/:folder",
  async ({params}) => {
    const {folder} = params;
    const views = new Array<SourceWebView>();
    let files: Array<SourceWeb>;
    if (folder === "root") {
      // 根目录
      // 查询源
      files = await sourceWebDao.selectRoot();
    } else if (folder === "all") {
      // 全部
      files = await sourceWebDao.selectList({is_enabled: 1});
    } else {
      // 指定目录
      files = await sourceWebDao.selectList({folder, is_enabled: 1})
    }
    files.forEach((e) => {
      views.push({
        ...e,
        props: JSON.parse(e.props),
        is_enabled: e.is_enabled !== 0,
      });
    });
    views.sort((a, b) => b.order - a.order);
    return Result.success(views);
  },
  {
    params: t.Object({
      folder: t.String(),
    }),
    detail: {
      tags: ["source/web"],
      summary: "查询网络资源列表",
      description: "查询网络资源列表",
    },
  }
);

export default app;
