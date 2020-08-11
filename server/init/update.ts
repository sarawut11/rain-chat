import * as dotenv from "dotenv";
dotenv.config();

import { getSqlShellList, runSqlShellList } from "./utils";

const updateDB = async () => {
  console.log("Updating DB Tables");
  const sqlShellList = getSqlShellList("update-table.sql");
  await runSqlShellList(sqlShellList);

  console.log("SQL command execution is over!");
  console.log("Please press ctrl + c to exit!");
};

updateDB();