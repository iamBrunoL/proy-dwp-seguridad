import { Router } from "express";
import {
  renderPrincipal,
} from "../controllers/usuarioController.js";
const router = Router();

router.get("/", renderPrincipal);

export default router;
