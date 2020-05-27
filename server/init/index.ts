/* eslint-disable guard-for-in */
import * as md5 from "md5";
import * as uuid from "uuid/v1";
import * as uniqid from "uniqid";
import * as moment from "moment";
import { getSqlContentMap } from "./util/getSQLConentMap";
import { query } from "./db";
import configs from "../src/configs/configs.dev";

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
  for (const key in sqlContentMap) {
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
  let sql = "INSERT INTO user_info (id, username, password, name, role, userid) VALUES (?,?,?,?,?,?);";
  await query(sql, [1, admin.username, md5(admin.password), admin.name, "OWNER", uniqid()]);

  // Create Vitae Rain Room
  const groupId = uuid();
  sql = "INSERT INTO group_info (id,to_group_id,name,group_notice,creator_id,create_time) VALUES (?,?,?,?,?,?);";
  await query(sql, [1, groupId, "Vitae Rain Room", "Vitae Rain Room", admin.id, moment().utc().unix()]);

  // Assign Admin to Vitae Rain Room
  sql = "INSERT INTO group_user_relation (id, to_group_id, userid) VALUE (?,?,?);";
  await query(sql, [1, groupId, 1]);

  console.log("SQL command execution is over!");
  console.log("Please press ctrl + c to exit!");
};

initDB();
