import { Router } from "express";
import {
  renderPrincipal,
} from "../controllers/paginasController.js";
const router = Router();

router.get("/", renderPrincipal);

export default router;
