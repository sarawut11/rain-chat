import * as fs from "fs";
import * as path from "path";
import { query } from "../src/app/utils/db";

export const getSqlShellList = (fileName: string): string[] => {
  const filePath = path.join(__dirname, "sql", fileName);
  const content = fs.readFileSync(filePath, "binary");
  const sqlShellList = content.split(";");
  return sqlShellList;
};

// Print script execution log
const eventLog = (err, index) => {
  if (err) {
    console.log(`[ERROR] ${index + 1}th command execution failed o(╯□╰)o ！`);
  } else {
    console.log(`[SUCCESS] ${index + 1}th command executed successfully O(∩_∩)O !`);
  }
};

export const runSqlShellList = async (shells: string[]) => {
  for (const [i, shell] of shells.entries()) {
    if (shell.trim()) {
      const result = await query(shell);
      if (result.serverStatus * 1 === 2) {
        eventLog(undefined, i);
      } else {
        eventLog(true, i);
      }
    }
  }
};