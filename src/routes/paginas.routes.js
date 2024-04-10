import { Router } from "express";
import { verificarAutenticacion, verificarRol } from "../controllers/authMiddleware.js"; // Asegúrate de que la ruta al archivo sea correcta
import { setNoCacheHeaders } from "../controllers/cache.js";
import { renderError } from "../controllers/paginasController.js";

import {
  renderLogin,
  renderPrincipal,
  renderEasterEgg,
  renderTableroUsuario,
  renderTableroAdmin,
  renderTableroSupervisor,
  renderErrorAcceso
} from "../controllers/paginasController.js";
const router = Router();


router.get("/", renderPrincipal);
router.get("/easteregg", renderEasterEgg);
router.get("/errorAcceso", renderErrorAcceso);
router.get("/error", renderError);
router.get("/login", renderLogin);
router.get("/tableroUsuario", setNoCacheHeaders, verificarAutenticacion, verificarRol("Usuario general"), renderTableroUsuario);
router.get("/tableroAdmin", setNoCacheHeaders, verificarAutenticacion, verificarRol("Administrador"), renderTableroAdmin);
router.get("/tableroSupervisor", setNoCacheHeaders, verificarAutenticacion, verificarRol("Supervisor"), renderTableroSupervisor);

export default router;
