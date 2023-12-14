import { Router } from 'express';
import { asignarPreguntasEvaluacion, obtenerEvaluadores, obtenerEvaluacion, obtenerUsuariosAEvaluar, guardarEvaluacion, obtenerResultadoEvaluacion, asignarEvaluadoresEmpresa, obtenerResultadoEvaluacionLider, obtenerRespuestasEvaluacion, obtenerEvaluacionCompentencias} from '../../controllers/EvaluacionController';

const router = Router();

// API url: /evaluacion

router.put('/preguntas', asignarPreguntasEvaluacion);
router.post('/asignar', asignarEvaluadoresEmpresa);

router.get('/evaluadores/:id', obtenerEvaluadores);
router.get('/usuarios/:id', obtenerUsuariosAEvaluar);

router.post('/respuestas', guardarEvaluacion);
router.get('/resultados/:id', obtenerResultadoEvaluacion)
router.get('/resultados/lider/:id', obtenerResultadoEvaluacionLider)

router.get('/respuestas/:id', obtenerRespuestasEvaluacion)

router.get('/competencias', obtenerEvaluacionCompentencias)

router.get('/:id', obtenerEvaluacion)

export default router;