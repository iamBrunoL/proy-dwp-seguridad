import express from "express";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import usuarioRoutes from "./routes/usuario.routes.js";
import citasRoutes from "./routes/citas.routes.js";
import paginasRoutes from "./routes/paginas.routes.js";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.set("port", process.env.PORT || 3000);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(session({
    secret: "secreto",
    resave: false,
    saveUninitialized: false
}));

app.use(express.urlencoded({ extended: false }));

app.use(usuarioRoutes);
app.use(citasRoutes);
app.use(paginasRoutes);

app.use(express.static(path.join(__dirname, "public")));

// Configura Express para escuchar solo en IPv4
const server = app.listen(process.env.PORT || 4000, '0.0.0.0', () => {
  console.log(`Servidor iniciado en http://0.0.0.0:${process.env.PORT || 3000}`);
});

export default app;
