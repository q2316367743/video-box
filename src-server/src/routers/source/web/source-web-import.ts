import { db } from "@/global/db";
import { SourceWeb } from "@/types/SourceWeb";
import { useSnowflake } from "@/utils/Snowflake";
import { Result } from "@/views/Result";
import { Elysia, t } from "elysia";

export async function importVideoSourceEntry(
  source: Record<string, any>
): Promise<SourceWeb> {
  if (!source.props) return Promise.reject(new Error("Missing source.props"));
  if (!source.type) return Promise.reject(new Error("Missing source.type"));
  if (!source.title) return Promise.reject(new Error("Missing source.title"));
  if (!source.props.url) return Promise.reject(new Error("请输入网站链接"));
  const now = Date.now();
  return {
    id: useSnowflake().nextId(),
    create_time: now,
    update_time: now,
    title: source.title,
    type: source.type,
    props: JSON.stringify(source.props),
    favicon: "",
    // 导入的都是根目录
    folder: "",
    order: now,
  };
}

const app = new Elysia();

app.post(
  "import",
  async ({ body }) => {
    const { file } = body;
    const json = (await file.json()) as Array<any>;
    for (const element of json) {
      try {
        const source = await importVideoSourceEntry(element);
        await db.sql`insert into source_web (id, create_time, update_time, title, \`type\`, favicon, folder, \`order\`, props) 
        values (${source.id}, ${source.create_time}, ${source.update_time}, ${source.title}, ${source.type}, ${source.favicon}, ${source.folder}, ${source.order}, ${source.props})`;
      } catch (error) {
        console.error(error);
      }
    }
    return Result.success();
  },
  {
    body: t.Object({
      file: t.File({
        maxSize: "1m",
      }),
    }),
    detail: {
      tags: ["source/web"],
      summary: "导入网络资源",
      description: "导入网络资源",
    },
  }
);

export default app;
