import * as Router from "koa-router";

export const appRoutes = new Router()
  .get("/alive", (ctx, next) => {
    ctx.body = {
      message: "server alive",
      time: new Date(),
    };
    ctx.status = 200;
  });
