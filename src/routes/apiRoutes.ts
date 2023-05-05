import { Router } from "express";

import usuarioRoutes from "./api/usuariosRoutes";
import areaRoutes from "./api/areasRoutes";
import departamentoRoutes from "./api/departamentosRoutes";
import perspectivaRoutes from "./api/perspectivasRoutes";
import estrategicoRoutes from './api/estrategicoRoutes'
import tacticoRoutes from './api/tacticoRoutes'
import operativoRoutes from './api/operativosRoutes'
import accionesRoutes from './api/accionesRoutes'
import resultadosRoutes from './api/resultadosRoutes'
import proyectosRoutes from './api/proyectosRoute'
import hitosRoutes from './api/hitosRoutes'
import tareasRoutes from './api/tareasRoutes'

import uploadRoutes from "./api/uploadRoutes";

const router = Router();

router.use('/upload', uploadRoutes)

router.use('/usuarios', usuarioRoutes)
router.use('/areas', areaRoutes )
router.use('/departamentos', departamentoRoutes)
router.use('/perspectivas', perspectivaRoutes)
router.use('/estrategicos', estrategicoRoutes)
router.use('/tacticos', tacticoRoutes)
router.use('/operativos', operativoRoutes)
router.use('/acciones', accionesRoutes)
router.use('/tareas', tareasRoutes)
router.use('/resultados', resultadosRoutes)
router.use('/proyectos', proyectosRoutes)   
router.use('/hitos', hitosRoutes)






export default router;