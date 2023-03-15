import { Router } from "express";

import usuarioRoutes from "./api/usuariosRoutes";
import areaRoutes from "./api/areasRoutes";
import departamentoRoutes from "./api/departamentosRoutes";
import perspectivaRoutes from "./api/perspectivasRoutes";

const router = Router();


router.use('/usuarios', usuarioRoutes)
router.use('/areas', areaRoutes )
router.use('/departamentos', departamentoRoutes)
router.use('/perspectivas', perspectivaRoutes)










export default router;