import * as dotenv from "dotenv";
dotenv.config();

import { getSqlShellList, runSqlShellList } from "./utils";
import * as md5 from "md5";
import { query } from "../src/app/utils/db";
import { rpcInterface } from "../src/app/utils/wallet/RpcInterface";
import { User } from "../src/app/models";
import * as uniqid from "uniqid";

const updateDB = async () => {
  let walletAddress = await rpcInterface.getNewAddress();
  let sql = "INSERT INTO user_info (username, email, password, name, role, refcode, walletAddress) VALUES (?,?,?,?,?,?,?);";
  await query(sql, ["CryptoParaglider", "russell@girdwood.net", md5("password"), "Crypto Paraglider", User.ROLE.OWNER, uniqid(), walletAddress]);

  walletAddress = await rpcInterface.getNewAddress();
  sql = "INSERT INTO user_info (username, email, password, name, role, refcode, walletAddress) VALUES (?,?,?,?,?,?,?);";
  await query(sql, ["Sarawut", "sanit.sa@outlook.com", md5("password"), "Sarawut Sanit", User.ROLE.OWNER, uniqid(), walletAddress]);

  console.log("Updating DB Tables");
  const sqlShellList = getSqlShellList("update-table.sql");
  await runSqlShellList(sqlShellList);

  console.log("SQL command execution is over!");
  console.log("Please press ctrl + c to exit!");
};

updateDB();