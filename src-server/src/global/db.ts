import { createDatabase } from "db0";
import bunSqliteConnector from "db0/connectors/bun-sqlite";
import { createStorage } from "unstorage";
import dbDriver from "unstorage/drivers/db0";
import { APP_DATA_PATH } from "@/global/constant.js";

export const db = createDatabase(
  bunSqliteConnector({
    path: APP_DATA_PATH,
  })
);

export const storage = createStorage({
  driver: dbDriver({ database: db }),
});
