import { Router } from "express";
import { verificarAutenticacion, verificarRol } from "../controllers/authMiddleware.js"; 
import { setNoCacheHeaders } from "../controllers/cache.js";
import { buscarCitaPorId, renderConsultaCitas, generarPDFCitas } from "../controllers/citaController.js";

import {
  createCita,
  deleteCita,
  editCita,
  renderCitas,
  updateCita,
  renderAgenda,
} from "../controllers/citaController.js";
const router = Router();



router.get('/generarPDFCitas', setNoCacheHeaders, verificarAutenticacion, verificarRol("Supervisor"), generarPDFCitas);


router.get("/agenda", setNoCacheHeaders, verificarAutenticacion, verificarRol("Usuario general"), renderAgenda);
router.post("/addCita", setNoCacheHeaders, verificarAutenticacion, verificarRol("Usuario general"), createCita);

router.get("/citas", setNoCacheHeaders, verificarAutenticacion, verificarRol("Administrador"), renderCitas);
router.get("/updateCita/:id", setNoCacheHeaders, verificarAutenticacion, verificarRol("Administrador"), editCita);
router.post("/updateCita/:id", setNoCacheHeaders, verificarAutenticacion, verificarRol("Administrador"), updateCita);
router.get("/deleteCita/:id", setNoCacheHeaders, verificarAutenticacion, verificarRol("Administrador"), deleteCita);
router.get("/buscarCita", setNoCacheHeaders, verificarAutenticacion, verificarRol("Administrador"), buscarCitaPorId);

router.get("/consultaCitas", setNoCacheHeaders, verificarAutenticacion, verificarRol("Supervisor"), renderConsultaCitas);

export default router;
