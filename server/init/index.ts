/* eslint-disable guard-for-in */
import * as md5 from "md5";
import * as uniqid from "uniqid";
import * as moment from "moment";
import { getSqlContentMap } from "./util/getSQLConentMap";
import { User } from "../src/app/models";
import { query } from "../src/app/utils/db";

const COMPANY_USERID = Number(process.env.COMPANY_USERID);
const COMPANY_RAIN_ADDRESS = process.env.COMPANY_RAIN_ADDRESS;
const COMPANY_STOCKPILE_USERID = Number(process.env.COMPANY_STOCKPILE_USERID);
const COMPANY_STOCKPILE_ADDRESS = process.env.COMPANY_STOCKPILE_ADDRESS;

const RAIN_GROUP_ID = process.env.RAIN_GROUP_ID;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_NAME = process.env.ADMIN_NAME;
const MAIL_USER = process.env.MAIL_USER;

// Print script execution log
const eventLog = (err, sqlFile, index) => {
  if (err) {
    console.log(`[ERROR] sql script file: ${sqlFile} ${index + 1}th command execution failed o(╯□╰)o ！`);
  } else {
    console.log(`[SUCCESS] sql script file: ${sqlFile} ${index + 1}th command executed successfully O(∩_∩)O !`);
  }
};

// Get all sql script content
const sqlContentMap = getSqlContentMap();

// Execute the table creation sql script
const initDB = async () => {
  // Initialize DB Tables
  console.log("Initializing DB Tables");
  for (const key of Object.keys(sqlContentMap)) {
    const sqlShell = sqlContentMap[key];
    const sqlShellList = sqlShell.split(";");

    for (const [i, shell] of sqlShellList.entries()) {
      if (shell.trim()) {
        const result = await query(shell);
        if (result.serverStatus * 1 === 2) {
          eventLog(undefined, key, i);
        } else {
          eventLog(true, key, i);
        }
      }
    }
  }

  console.log("Initializing Default Values");
  // Create Company Rain & Stockpile account
  let sql = "INSERT INTO user_info (id, username, email, password, name, role, refcode, walletAddress) VALUES (?,?,?,?,?,?,?,?);";
  await query(sql, [COMPANY_USERID, "COMPANY", "company@wallet.com", md5(uniqid()), "Company Wallet", User.ROLE.COMPANY, uniqid(), COMPANY_RAIN_ADDRESS]);
  sql = "INSERT INTO user_info (id, username, email, password, name, role, refcode, walletAddress) VALUES (?,?,?,?,?,?,?,?);";
  await query(sql, [COMPANY_STOCKPILE_USERID, "STOCKPILE", "company.stockpile@wallet.com", md5(uniqid()), "Company Stockpile", User.ROLE.STOCKPILE, uniqid(), COMPANY_STOCKPILE_ADDRESS]);
  // Create Default Owner ( Admin )
  sql = "INSERT INTO user_info (username, email, password, name, role, refcode) VALUES (?,?,?,?,?,?);";
  await query(sql, [ADMIN_USERNAME, MAIL_USER, md5(ADMIN_PASSWORD), ADMIN_NAME, User.ROLE.OWNER, uniqid()]);

  // Create Vitae Rain Room
  sql = "INSERT INTO group_info (id,groupId,name,description,creatorId,createTime) VALUES (?,?,?,?,?,?);";
  await query(sql, [1, RAIN_GROUP_ID, "Vitae Rain Room", "Vitae Rain Room", 1, moment().utc().unix()]);

  // Assign Admin to Vitae Rain Room
  sql = "INSERT INTO group_user_relation (id, groupId, userId) VALUE (?,?,?);";
  await query(sql, [1, RAIN_GROUP_ID, 1]);
  sql = "INSERT INTO rain_group_msg (fromUser, groupId, message, time, attachments) VALUE (?,?,?,?,?);";
  await query(sql, [0, RAIN_GROUP_ID, "Welcome to Vitae Rain Room", moment().utc().unix(), "[]"]);

  console.log("SQL command execution is over!");
  console.log("Please press ctrl + c to exit!");
};

initDB();
