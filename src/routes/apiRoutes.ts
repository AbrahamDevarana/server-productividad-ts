import { Router } from "express";

import usuarioRoutes from "./api/usuariosRoutes";
import areaRoutes from "./api/areasRoutes";
import departamentoRoutes from "./api/departamentosRoutes";
import perspectivaRoutes from "./api/perspectivasRoutes";
import estrategicoRoutes from './api/estrategicoRoutes'
import tacticoRoutes from './api/tacticoRoutes'

const router = Router();


router.use('/usuarios', usuarioRoutes)
router.use('/areas', areaRoutes )
router.use('/departamentos', departamentoRoutes)
router.use('/perspectivas', perspectivaRoutes)
router.use('/estrategicos', estrategicoRoutes)
router.use('/tacticos', tacticoRoutes)



export default router;