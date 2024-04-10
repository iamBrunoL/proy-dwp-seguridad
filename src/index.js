import app from "./app.js";
import { port } from "./config.js";

app.listen(port);
console.log(`Despliegue en el puerto ${port} del servidor`);
