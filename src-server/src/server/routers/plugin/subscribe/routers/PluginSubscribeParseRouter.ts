import {Elysia, t} from "elysia";
import {subscribeParseService} from "@/service/plugin/subscribe/SubscribeParseService";
import {SourceSubscribePostParam} from "@/types/SourceSubscribe";
import {Result} from "@/views/Result";

export default new Elysia()
  .post('parse', async ({body}) => {
    const result = await subscribeParseService(body as SourceSubscribePostParam);
    return Result.success(result);
  }, {
    body: t.Object({
      name: t.String(),
      description: t.String(),
      url: t.String(),
      link: t.String(),
      group: t.String(),
      type: t.Number(),
      driver: t.String(),
      display: t.Number(),
      ai: t.Number(),
      rule: t.Object({
        data: t.Record(t.String(), t.Any()),
        list: t.String(),
        item_title: t.String(),
        item_description: t.String(),
        item_pub_date: t.String(),
        item_link: t.String(),
        item_content: t.String(),
        item_charset: t.String(),
      })
    })
  })