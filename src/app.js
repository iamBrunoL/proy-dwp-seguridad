import express from "express";
import session from "express-session";
import path from "path";
import morgan from "morgan";
import { fileURLToPath } from "url";

import usuarioRoutes from "./routes/usuario.routes.js";
import citasRoutes from "./routes/citas.routes.js";
import paginasRoutes from "./routes/paginas.routes.js";
import Redis from "ioredis"; // Asegúrate de haber instalado el paquete "ioredis"


const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.set("port", process.env.PORT || 3000);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Crea una instancia de Redis
const redisClient = new Redis();

// Configura express-session para utilizar Redis como almacén de sesiones
app.use(session({
    store: new RedisStore({ client: redisClient }),
    secret: 'secreto',
    resave: false,
    saveUninitialized: false,
}));

//app.use(morgan("dev"));

app.use(express.urlencoded({ extended: false }));

app.use(usuarioRoutes);
app.use(citasRoutes);
app.use(paginasRoutes);

app.use(express.static(path.join(__dirname, "public")));

export default app;
