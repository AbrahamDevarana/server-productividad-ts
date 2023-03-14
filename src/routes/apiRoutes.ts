import { Router } from "express";

import usuarioRoutes from "./api/usuariosRoutes";
import areaRoutes from "./api/areasRoutes";
import departamentoRoutes from "./api/departamentosRoutes";

const router = Router();


router.use('/usuarios', usuarioRoutes)
router.use('/areas', areaRoutes )
router.use('/departamentos', departamentoRoutes)










export default router;