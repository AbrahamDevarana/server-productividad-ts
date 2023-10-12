import { Router } from "express";

import usuarioRoutes from "./api/usuariosRoutes";
import perfilRoutes from "./api/perfilRoutes";
import areaRoutes from "./api/areasRoutes";
import departamentoRoutes from "./api/departamentosRoutes";
import perspectivaRoutes from "./api/perspectivasRoutes";
import estrategicoRoutes from './api/estrategicoRoutes'
import tacticoRoutes from './api/tacticoRoutes'
import operativoRoutes from './api/operativosRoutes'
import taskRoutes from './api/taskRoutes'
import resultadosRoutes from './api/resultadosRoutes'
import proyectosRoutes from './api/proyectosRoute'
import hitosRoutes from './api/hitosRoutes'
import tareasRoutes from './api/tareasRoutes'
import comentariosRoutes from './api/comentariosRoutes'
import permisosRoutes from './api/permisosRoutes'
import reportesRoutes from './api/reportesRoutes'

import galeriaRoutes from "./api/galeriaRoutes";
import uploadRoutes from "./api/uploadRoutes";
import rendimientoRoutes from "./api/rendimientoRoutes";
import evaluacionRoutes from "./api/evaluacionRoutes";
import historialPerformanceRoutes from "./api/historialPerformanceRoutes";


const router = Router();

router.use('/upload', uploadRoutes)

router.use('/usuarios', usuarioRoutes)
router.use('/perfiles', perfilRoutes)
router.use('/areas', areaRoutes )
router.use('/departamentos', departamentoRoutes)
router.use('/perspectivas', perspectivaRoutes)
router.use('/estrategicos', estrategicoRoutes)
router.use('/tacticos', tacticoRoutes)
router.use('/operativos', operativoRoutes)
router.use('/tasks', taskRoutes)
router.use('/tareas', tareasRoutes)
router.use('/resultados', resultadosRoutes)
router.use('/proyectos', proyectosRoutes)   
router.use('/hitos', hitosRoutes)
router.use('/comentarios', comentariosRoutes)
router.use('/permisos', permisosRoutes)
router.use('/rendimiento', rendimientoRoutes)
router.use('/evaluacion', evaluacionRoutes)
router.use('/historial-performance', historialPerformanceRoutes)
router.use('/reportes', reportesRoutes)

router.use('/galeria', galeriaRoutes)




export default router;