import { Router } from "express";
import { cerrarSesion, generarPDFPersonal, iniciarSesion, renderConsultaPersonal, renderConsultaUsuarios, createUsuariosPersonal, renderPersonal, updateUsuarioRole, renderModificarRolUsuarios } from "../controllers/usuarioController.js";
import { verificarAutenticacion, verificarRol } from "../controllers/authMiddleware.js";
import { setNoCacheHeaders } from "../controllers/cache.js";
import { renderMisDatos, buscarUsuario, generarPDFUsuarios } from "../controllers/usuarioController.js";
import { renderMisCitas } from "../controllers/citaController.js";

import {
  createUsuarios,
  deleteUsuario,
  editUsuario,
  renderUsuarios,
  updateUsuario,
  renderRegistro,
} from "../controllers/usuarioController.js";
const router = Router();


router.get("/misDatos", setNoCacheHeaders, verificarAutenticacion, verificarRol("Usuario general"), renderMisDatos);
router.get("/misCitas", setNoCacheHeaders, verificarAutenticacion, verificarRol("Usuario general"), renderMisCitas);

router.get("/buscarUsuario", setNoCacheHeaders, verificarAutenticacion, verificarRol("Administrador"), buscarUsuario);
router.get("/usuario", setNoCacheHeaders, verificarAutenticacion, verificarRol("Administrador"), renderUsuarios);
router.get("/updateUsuario/:id",setNoCacheHeaders, verificarAutenticacion, verificarRol("Administrador"), editUsuario);
router.post("/updateUsuario/:id", setNoCacheHeaders, verificarAutenticacion, verificarRol("Administrador"),  updateUsuario);
router.get("/deleteUsuario/:id", setNoCacheHeaders, verificarAutenticacion, verificarRol("Administrador"), deleteUsuario);

router.get("/consultaUsuarios", setNoCacheHeaders, verificarAutenticacion, verificarRol("Supervisor"), renderConsultaUsuarios);
router.get("/consultaPersonal", setNoCacheHeaders, verificarAutenticacion, verificarRol("Supervisor"), renderConsultaPersonal);

router.post("/iniciarSesion", iniciarSesion);
router.get("/cerrarSesion", cerrarSesion);
router.get("/registro", renderRegistro);
router.post("/addUsuario", createUsuarios);


router.get("/personal", setNoCacheHeaders, verificarAutenticacion, verificarRol("Supervisor"), renderPersonal);
router.post("/addPersonal", setNoCacheHeaders, verificarAutenticacion, verificarRol("Supervisor"), createUsuariosPersonal);
router.post("/updateUsuarioRole/:id", setNoCacheHeaders, verificarAutenticacion, verificarRol("Supervisor"), updateUsuarioRole);
router.get("/modificarRolUsuarios/:id", setNoCacheHeaders, verificarAutenticacion, verificarRol("Supervisor"), renderModificarRolUsuarios);

router.get('/generarPDFUsuarios', setNoCacheHeaders, verificarAutenticacion, verificarRol("Supervisor"), generarPDFUsuarios);
router.get('/generarPDFPersonal', setNoCacheHeaders, verificarAutenticacion, verificarRol("Supervisor"), generarPDFPersonal);
export default router;
