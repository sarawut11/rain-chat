import { createPool } from "mysql";
import configs from "@configs";

const pool = createPool({ ...configs.dbConnection, multipleStatements: true });

export const query = (sql, values?): Promise<any> =>
  new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        console.log("query connec error!", err);
        // resolve(err);
      } else {
        connection.query(sql, values, (error, rows) => {
          if (error) {
            console.error("QUERY ERROR:", error.message);
            console.log(sql);
            reject(error);
          } else {
            resolve(rows);
          }
          connection.release();
        });
      }
    });
  });
