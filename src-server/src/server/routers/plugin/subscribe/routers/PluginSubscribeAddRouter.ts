import {Elysia, t} from "elysia";

export default new Elysia()
  .post('add', async ({body}) => {

  }, {
    body: t.Object({
      group: t.String(),
      type: t.Number(),
      driver: t.String(),
      display: t.Number(),
      name: t.String(),
      description: t.String(),
      url: t.String(),
      ai: t.Number(),
      data: t.Record(t.String(), t.Any()),
      rule: t.Object({
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