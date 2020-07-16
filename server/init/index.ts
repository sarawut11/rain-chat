/* eslint-disable guard-for-in */
import * as md5 from "md5";
import * as uniqid from "uniqid";
import * as moment from "moment";
import { getSqlContentMap } from "./util/getSQLConentMap";
import { query } from "./db";
import { User } from "../src/app/models";

const COMPANY_USERID = Number(process.env.COMPANY_USERID);
const COMPANY_USERNAME = process.env.COMPANY_USERNAME;
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
  // Create Default Owner ( Admin )
  let sql = "INSERT INTO user_info (id, username, email, password, name, role, refcode) VALUES (?,?,?,?,?,?,?);";
  await query(sql, [COMPANY_USERID, COMPANY_USERNAME, "company@wallet.com", md5(uniqid()), "Company Wallet", User.ROLE.COMPANY, uniqid()]);

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
