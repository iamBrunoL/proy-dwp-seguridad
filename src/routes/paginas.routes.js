import { Router } from "express";
import { verificarAutenticacion } from "../controllers/authMiddleware.js"; // Asegúrate de que la ruta al archivo sea correcta

import {
  renderLogin,
  renderPrincipal,
  renderTableroUsuario,
  renderTableroAdmin
} from "../controllers/paginasController.js";
const router = Router();


router.get("/", renderPrincipal);
router.get("/login", renderLogin);
router.get("/tableroUsuario", verificarAutenticacion, renderTableroUsuario);
router.get("/tableroAdmin", verificarAutenticacion, renderTableroAdmin);

export default router;
