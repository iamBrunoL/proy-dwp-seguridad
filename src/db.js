import { createPool } from "mysql2/promise";

export const pool = createPool({
  host: "200.39.120.42",
  user: "root",
  password: "",
  port: 3306,
  database: "proy-dwp",
});
