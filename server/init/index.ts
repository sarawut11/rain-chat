/* eslint-disable guard-for-in */
import * as md5 from "md5";
import * as uniqid from "uniqid";
import * as moment from "moment";
import { getSqlContentMap } from "./util/getSQLConentMap";
import { query } from "./db";
import configs from "../src/configs/configs.dev";
import { User } from "../src/app/models";

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
  const admin = configs.default_admin;
  let sql = "INSERT INTO user_info (username, email, password, name, role, refcode) VALUES (?,?,?,?,?,?);";
  await query(sql, [admin.username, "admin@vitae.com", md5(admin.password), admin.name, User.ROLE.OWNER, uniqid()]);

  // Create Vitae Rain Room
  const rainGroupId = configs.rain.group_id;
  sql = "INSERT INTO group_info (id,to_group_id,name,group_notice,creator_id,create_time) VALUES (?,?,?,?,?,?);";
  await query(sql, [1, rainGroupId, "Vitae Rain Room", "Vitae Rain Room", 1, moment().utc().unix()]);

  // Assign Admin to Vitae Rain Room
  sql = "INSERT INTO group_user_relation (id, to_group_id, user_id) VALUE (?,?,?);";
  await query(sql, [1, rainGroupId, 1]);
  sql = "INSERT INTO rain_group_msg (from_user, to_group_id, message, time, attachments) VALUE (?,?,?,?,?);";
  await query(sql, [0, rainGroupId, "Welcome to Vitae Rain Room", moment().utc().unix(), "[]"]);

  console.log("SQL command execution is over!");
  console.log("Please press ctrl + c to exit!");
};

initDB();
