/* eslint-disable prettier/prettier */
import { walkFile } from "./walkFile";

/**
 * Get file directory data under sql directory
 * @return {object}
 */
export function getSqlMap(): object {
  let basePath = __dirname;
  basePath = basePath.replace(/\\/g, "/");

  let pathArr = basePath.split("/");
  pathArr = pathArr.splice(0, pathArr.length - 1);
  basePath = `${pathArr.join("/")}/sql/`;

  const fileList = walkFile(basePath, "sql");
  return fileList;
}
