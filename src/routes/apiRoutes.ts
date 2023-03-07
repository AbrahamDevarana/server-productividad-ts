import { Router } from "express";

import usuarioRoutes from "./api/usuariosRoutes";
import areaRoutes from "./api/areasRoutes";

const router = Router();


router.use('/usuarios', usuarioRoutes)
router.use('/areas', areaRoutes )










export default router;