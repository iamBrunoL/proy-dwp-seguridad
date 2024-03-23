import { Router } from "express";
import { cerrarSesion, iniciarSesion } from "../controllers/usuarioController.js";
import { verificarAutenticacion } from "../controllers/authMiddleware.js";
import { setNoCacheHeaders } from "../controllers/cache.js";

import {
  createUsuarios,
  deleteUsuario,
  editUsuario,
  renderUsuarios,
  updateUsuario,
  renderRegistro,
} from "../controllers/usuarioController.js";
const router = Router();


router.post("/iniciarSesion", iniciarSesion);
router.get("/cerrarSesion", cerrarSesion);
router.get("/registro", renderRegistro);
router.get("/usuario", setNoCacheHeaders, verificarAutenticacion, renderUsuarios);
router.post("/addUsuario", createUsuarios);
router.get("/updateUsuario/:id",setNoCacheHeaders, verificarAutenticacion, editUsuario);
router.post("/updateUsuario/:id", setNoCacheHeaders, verificarAutenticacion,  updateUsuario);
router.get("/deleteUsuario/:id", setNoCacheHeaders, verificarAutenticacion, deleteUsuario);

export default router;
