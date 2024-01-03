import { Router } from 'express';
import { asignarPreguntasEvaluacion, obtenerEvaluadores, obtenerEvaluacion, obtenerUsuariosAEvaluar, guardarEvaluacion, obtenerResultadoEvaluacion, asignarEvaluadoresEmpresa, obtenerResultadoEvaluacionLider, obtenerRespuestasEvaluacion, 
    
    getEvaluaciones, createAsignacionEvaluacion, deleteAsignacionEvaluacion, getEvaluacion, asignarEvaluaciones 
} from '../../controllers/EvaluacionController';

const router = Router();

// API url: /evaluacion 

//TODO: cambiar la url de competencias a evaluacion cuando se ajusten los demás servicios

router.put('/preguntas', asignarPreguntasEvaluacion);
router.post('/asignar', asignarEvaluadoresEmpresa);
router.get('/evaluadores/:id', obtenerEvaluadores);
router.get('/usuarios/:id', obtenerUsuariosAEvaluar);
router.post('/respuestas', guardarEvaluacion);
router.get('/resultados/:id', obtenerResultadoEvaluacion)
router.get('/resultados/lider/:id', obtenerResultadoEvaluacionLider)
router.get('/respuestas/:id', obtenerRespuestasEvaluacion)



router.get('/competencias', getEvaluaciones)
router.post('/competencias', createAsignacionEvaluacion)
router.delete('/competencias', deleteAsignacionEvaluacion)
router.post('/competencias/generate', asignarEvaluadoresEmpresa);
router.get('/competencias/:id', getEvaluacion)


router.get('/:id', obtenerEvaluacion)

export default router;