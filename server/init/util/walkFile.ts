import * as fs from "fs";

/**
 * Traverse the file directory under the directory
 * @param  {string} pathResolve  Directory path to be traversed
 * @param  {string} mime         Suffix name of traversal file
 * @return {object}              Returns the directory result after traversal
 */
export const walkFile = (pathResolve: string, mime: string): object => {
  const files = fs.readdirSync(pathResolve);
  const fileList = {};
  for (const [i, item] of files.entries()) {
    const itemArr = item.split(".");

    const itemMime = itemArr.length > 1 ? itemArr[itemArr.length - 1] : "undefined";
    if (mime === itemMime) {
      fileList[item] = pathResolve + item;
    }
  }

  return fileList;
};
