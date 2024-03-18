import { Router } from "express";
import {
  createCita,
  deleteCita,
  editCita,
  renderCitas,
  updateCita,
  renderAgenda,
} from "../controllers/citaController.js";
const router = Router();


router.get("/agenda", renderAgenda);
router.get("/citas", renderCitas);
router.post("/addCita", createCita);
router.get("/updateCita/:id", editCita);
router.post("/updateCita/:id", updateCita);
router.get("/deleteCita/:id", deleteCita);

export default router;
