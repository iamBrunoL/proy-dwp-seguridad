import { Router } from "express";
import { cerrarSesion, iniciarSesion } from "../controllers/usuarioController.js";
import { verificarAutenticacion } from "../controllers/authMiddleware.js";

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
router.get("/usuario", verificarAutenticacion, renderUsuarios);
router.post("/addUsuario",  createUsuarios);
router.get("/updateUsuario/:id",  verificarAutenticacion, editUsuario);
router.post("/updateUsuario/:id", verificarAutenticacion,  updateUsuario);
router.get("/deleteUsuario/:id", verificarAutenticacion, deleteUsuario);

export default router;
