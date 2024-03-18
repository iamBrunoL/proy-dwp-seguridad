import express from "express";
import path from "path";
import morgan from "morgan";

import usuarioRoutes from "./routes/usuario.routes.js";
import citasRoutes from "./routes/citas.routes.js";
import paginasRoutes from "./routes/paginas.routes.js";
import { fileURLToPath } from "url";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// settings
app.set("port", process.env.PORT || 3000);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// middlewares
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));

// routes
app.use(usuarioRoutes);
app.use(citasRoutes);
app.use(paginasRoutes);

// static files
app.use(express.static(path.join(__dirname, "public")));

// starting the server
export default app;
