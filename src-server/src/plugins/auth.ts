import Elysia from "elysia";

export function auth() {
  const app = new Elysia();
  app.onRequest(async () => {});

  return app;
}
