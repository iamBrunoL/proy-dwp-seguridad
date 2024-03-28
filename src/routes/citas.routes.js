import { Router } from "express";
import { verificarAutenticacion } from "../controllers/authMiddleware.js"; 
import { setNoCacheHeaders } from "../controllers/cache.js";
import {
  createCita,
  deleteCita,
  editCita,
  renderCitas,
  updateCita,
  renderAgenda,
} from "../controllers/citaController.js";
const router = Router();


router.get("/agenda", setNoCacheHeaders, verificarAutenticacion, renderAgenda);
router.get("/citas", setNoCacheHeaders, verificarAutenticacion, renderCitas);
router.post("/addCita", setNoCacheHeaders, verificarAutenticacion, createCita);
router.get("/updateCita/:id", setNoCacheHeaders, verificarAutenticacion, editCita);
router.post("/updateCita/:id", setNoCacheHeaders, verificarAutenticacion, updateCita);
router.get("/deleteCita/:id", setNoCacheHeaders, verificarAutenticacion, deleteCita);

export default router;
