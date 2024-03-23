import { Router } from "express";
import { verificarAutenticacion } from "../controllers/authMiddleware.js"; 
import {
  createCita,
  deleteCita,
  editCita,
  renderCitas,
  updateCita,
  renderAgenda,
} from "../controllers/citaController.js";
const router = Router();


router.get("/agenda", verificarAutenticacion, renderAgenda);
router.get("/citas", verificarAutenticacion, renderCitas);
router.post("/addCita", verificarAutenticacion, createCita);
router.get("/updateCita/:id", verificarAutenticacion, editCita);
router.post("/updateCita/:id", verificarAutenticacion, updateCita);
router.get("/deleteCita/:id", verificarAutenticacion, deleteCita);

export default router;
