import { Router } from "express";
import { verificarAutenticacion } from "../controllers/authMiddleware.js"; // Asegúrate de que la ruta al archivo sea correcta
import { setNoCacheHeaders } from "../controllers/cache.js";

import {
  renderLogin,
  renderPrincipal,
  renderTableroUsuario,
  renderTableroAdmin
} from "../controllers/paginasController.js";
const router = Router();


router.get("/", renderPrincipal);
router.get("/login", renderLogin);
router.get("/tableroUsuario", setNoCacheHeaders, verificarAutenticacion, renderTableroUsuario);
router.get("/tableroAdmin", setNoCacheHeaders, verificarAutenticacion, renderTableroAdmin);

export default router;
