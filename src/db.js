import { createPool } from "mysql2/promise";

export const pool = createPool({
  host: "blao5xqfq9hfx2xk7rgf-mysql.services.clever-cloud.com",
  user: "u1vuve184jrusyc2",
  password: "ik3esLZEGNz9M3Iys0T3",
  port: 3306,
  database: "blao5xqfq9hfx2xk7rgf",
});



// Registro de log
   let crearLog = `Despliegue de aplicación (Sapphire Networks) a las ${new Date().toLocaleString()}`;
   pool.query("INSERT INTO reportes (contenido) values (?)", [crearLog]);
