/* eslint-disable guard-for-in */
import * as md5 from "md5";
import * as uniqid from "uniqid";
import * as moment from "moment";
import * as dotenv from "dotenv";
dotenv.config();

import { getSqlShellList, runSqlShellList } from "./utils";
import { User } from "../src/app/models";
import { query } from "../src/app/utils/db";
import { rpcInterface } from "../src/app/utils/wallet/RpcInterface";

const COMPANY_USERID = Number(process.env.COMPANY_USERID);
const COMPANY_RAIN_ADDRESS = process.env.COMPANY_RAIN_ADDRESS;
const COMPANY_STOCKPILE_USERID = Number(process.env.COMPANY_STOCKPILE_USERID);
const COMPANY_STOCKPILE_ADDRESS = process.env.COMPANY_STOCKPILE_ADDRESS;

const RAIN_GROUP_ID = process.env.RAIN_GROUP_ID;

// Execute the table creation sql script
const initDB = async () => {
  // Initialize DB Tables
  console.log("Initializing DB Tables...");
  const sqlShellList = getSqlShellList("create-table.sql");
  await runSqlShellList(sqlShellList);

  console.log("Initializing Default Settings...");
  await addSettings();

  console.log("Initializing Default Values...");
  // Create Company Rain & Stockpile account
  let sql = "INSERT INTO user_info (id, username, email, password, name, role, refcode, walletAddress) VALUES (?,?,?,?,?,?,?,?);";
  await query(sql, [COMPANY_USERID, "COMPANY", "company@wallet.com", md5(uniqid()), "Company Wallet", User.ROLE.COMPANY, uniqid(), COMPANY_RAIN_ADDRESS]);
  sql = "INSERT INTO user_info (id, username, email, password, name, role, refcode, walletAddress) VALUES (?,?,?,?,?,?,?,?);";
  await query(sql, [COMPANY_STOCKPILE_USERID, "STOCKPILE", "company.stockpile@wallet.com", md5(uniqid()), "Company Stockpile", User.ROLE.STOCKPILE, uniqid(), COMPANY_STOCKPILE_ADDRESS]);

  // Create Default Owner ( Admin )
  let walletAddress = await rpcInterface.getNewAddress();
  sql = "INSERT INTO user_info (username, email, password, name, role, refcode, walletAddress) VALUES (?,?,?,?,?,?,?);";
  await query(sql, ["iqmojo", "mojo00web@gmail.com", md5("password"), "Michael Bradley", User.ROLE.OWNER, uniqid(), walletAddress]);

  walletAddress = await rpcInterface.getNewAddress();
  sql = "INSERT INTO user_info (username, email, password, name, role, refcode, walletAddress) VALUES (?,?,?,?,?,?,?);";
  await query(sql, ["CryptoParaglider", "russell@girdwood.net", md5("password"), "Crypto Paraglider", User.ROLE.OWNER, uniqid(), walletAddress]);

  walletAddress = await rpcInterface.getNewAddress();
  sql = "INSERT INTO user_info (username, email, password, name, role, refcode, walletAddress) VALUES (?,?,?,?,?,?,?);";
  await query(sql, ["Sarawut", "sanit.sa@outlook.com", md5("password"), "Sarawut Sanit", User.ROLE.OWNER, uniqid(), walletAddress]);

  // Create Vitae Rain Room
  sql = "INSERT INTO group_info (id,groupId,name,description,creatorId,createTime) VALUES (?,?,?,?,?,?);";
  await query(sql, [1, RAIN_GROUP_ID, "Vitae Rain Room", "Vitae Rain Room", 1, moment().utc().unix()]);

  // Assign Admin to Vitae Rain Room
  sql = "INSERT INTO group_user_relation (groupId, userId) VALUE (?,?);";
  await query(sql, [RAIN_GROUP_ID, 3]);
  await query(sql, [RAIN_GROUP_ID, 4]);
  await query(sql, [RAIN_GROUP_ID, 5]);
  sql = "INSERT INTO rain_group_msg (fromUser, groupId, message, time, attachments) VALUE (?,?,?,?,?);";
  await query(sql, [0, RAIN_GROUP_ID, "Welcome to Vitae Rain Room", moment().utc().unix(), "[]"]);

  console.log("SQL command execution is over!");
  console.log("Please press ctrl + c to exit!");
};

const addSettings = async () => {
  await addSetting("COMPANY_REV_COMPANY_EXPENSE", "0.2", "DOUBLE");
  await addSetting("COMPANY_REV_OWNER_SHARE", "0.3", "DOUBLE");
  await addSetting("COMPANY_REV_MODER_SHARE", "0.25", "DOUBLE");
  await addSetting("COMPANY_REV_MEMBER_SHARE", "0.25", "DOUBLE");

  await addSetting("POP_RAIN_BALANCE_LIMIT", "10", "DOUBLE");
  await addSetting("POP_RAIN_LAST_POST_USER", "200", "INT");

  await addSetting("STOCKPILE_RAIN_INTERVAL", "360000", "INT");
  await addSetting("STOCKPILE_RAIN_AMOUNT", "0.1", "DOUBLE");

  await addSetting("RAIN_ADS_COMING_AFTER", "5000", "INT");
  await addSetting("RAIN_ADS_DURATION", "10000", "INT");
  await addSetting("RAIN_ADS_INTERVAL", "300000", "INT");
  await addSetting("STATIC_ADS_INTERVAL", "300000", "INT");

  await addSetting("COST_PER_IMPRESSION_RAIN_ADS", "0.0005", "DOUBLE");
  await addSetting("COST_PER_IMPRESSION_STATIC_ADS", "0.001", "DOUBLE");
  await addSetting("MINIMUM_IMP_PURCHASE", "20000", "INT");

  await addSetting("ADS_REV_COMPANY_SHARE", "0.25", "DOUBLE");
  await addSetting("ADS_REV_IMP_REVENUE", "0.75", "DOUBLE");

  await addSetting("VITAE_POST_TIME", "10000", "INT");
  await addSetting("VITAE_POST_TEXT", "I love Vitae! :heart:", "STRING");

  await addSetting("MEMBERSHIP_PRICE_USD", "14.99", "DOUBLE");
  await addSetting("MEMBERSHIP_REV_COMPANY_SHARE", "0.3328885924", "DOUBLE");
  await addSetting("MEMBERSHIP_REV_SPONSOR_SHARE", "0.3335557038", "DOUBLE");
  await addSetting("SPONSOR_SHARE_FIRST", "0.5", "DOUBLE");
  await addSetting("SPONSOR_SHARE_SECOND", "0.25", "DOUBLE");
  await addSetting("SPONSOR_SHARE_THIRD", "0.25", "DOUBLE");

  await addSetting("TRANSACTION_REQUEST_EXPIRE", "300000", "INT");
  await addSetting("OTP_EXPIRE", "60000", "INT");
};

const addSetting = async (key: string, value: string, type: string) => {
  const sql = "INSERT INTO setting_info (name, value, type) VALUES(?,?,?);";
  await query(sql, [key, value, type]);
};

initDB();
