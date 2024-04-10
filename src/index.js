import app from "./app.js";
import { port } from "./config.js";

app.listen(port);
console.log(`Despliegue en el puerto ${port} del servidor`);


// Registro de log
   let crearLog = `Despliegue de aplicación (Sapphire Networks) a las ${new Date().toLocaleString()}`;
   pool.query("INSERT INTO reportes (contenido) values (?)", [crearLog]);
