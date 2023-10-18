import { Router } from 'express';
import { asignarPreguntasEvaluacion, obtenerEvaluadores, obtenerEvaluacion, obtenerUsuariosAEvaluar, guardarEvaluacion, obtenerResultadoEvaluacion, asignarEvaluadoresEmpresa, obtenerResultadoEvaluacionLider, obtenerRespuestasEvaluacion} from '../../controllers/EvaluacionController';

const router = Router();

// API url: /evaluacion

router.put('/preguntas', asignarPreguntasEvaluacion);
router.post('/asignar', asignarEvaluadoresEmpresa);

router.get('/evaluadores/:id', obtenerEvaluadores);
router.get('/usuarios/:id', obtenerUsuariosAEvaluar);
router.get('/:id', obtenerEvaluacion)
router.post('/respuestas', guardarEvaluacion);
router.get('/resultados/:id', obtenerResultadoEvaluacion)
router.get('/resultados/lider/:id', obtenerResultadoEvaluacionLider)

router.get('/respuestas/:id', obtenerRespuestasEvaluacion)


// router.post('/equipo', createEvaluacionEquipo);
// router.post('/colaboradores', createEvaluacionCoolaboradores);
// router.get('/:id', getEvaluacion)

export default router;