export const port = process.env.PORT || 3000;


// Registro de log
   let crearLog = `Despliegue de aplicación (Sapphire Networks) a las ${new Date().toLocaleString()}`;
   pool.query("INSERT INTO reportes (contenido) values (?)", [crearLog]);
