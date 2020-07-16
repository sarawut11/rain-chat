import { createPool } from "mysql";

const pool = createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  multipleStatements: true
});

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
