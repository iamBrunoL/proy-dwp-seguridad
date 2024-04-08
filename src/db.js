import { createPool } from "mysql2/promise";

export const pool = createPool({
  host: "monorail.proxy.rlwy.net",
  user: "root",
  password: "THlTMvLscxsrzJAtqAcUVvKAFnfZmkIn",
  port: 42254,
  database: "railway",
});
