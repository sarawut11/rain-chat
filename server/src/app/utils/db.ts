import { createPool } from "mysql";

const pool = createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
});

export const query = (sql, values?): Promise<any> =>
  new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        console.log("query connec error!", err);
        // resolve(err);
      } else {
        connection.query(sql, values, (err, rows) => {
          if (err) {
            console.error("QUERY ERROR:", err.message);
            reject(err);
          } else {
            resolve(rows);
          }
          connection.release();
        });
      }
    });
  });
