import { Router } from "express";
import {
  createUsuarios,
  deleteUsuario,
  editUsuario,
  renderUsuarios,
  updateUsuario,
  renderRegistro,
} from "../controllers/usuarioController.js";
const router = Router();


router.get("/registro", renderRegistro);
router.get("/usuario", renderUsuarios);
router.post("/addUsuario", createUsuarios);
router.get("/updateUsuario/:id", editUsuario);
router.post("/updateUsuario/:id", updateUsuario);
router.get("/deleteUsuario/:id", deleteUsuario);

export default router;
