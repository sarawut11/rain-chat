import * as fs from "fs";
import { getSqlMap } from "./getSQLMap";

const sqlContentMap = {};

/**
 * Read sql file content
 * @param  {string} fileName fileName
 * @param  {string} path     The path where the file is located
 * @return {string}          Script file content
 */
function getSqlContent(fileName: string, path: string) {
  const content = fs.readFileSync(path, "binary");
  sqlContentMap[fileName] = content;
}

/**
 * Package all sql file script content
 * @return {object}
 */
export function getSqlContentMap(): object {
  const sqlMap = getSqlMap();
  // eslint-disable-next-line guard-for-in
  for (const key in sqlMap) {
    getSqlContent(key, sqlMap[key]);
  }

  return sqlContentMap;
}
