import { Router } from 'express';
import { asignarPreguntasEvaluacion, asignarEvaluadores, obtenerEvaluadores, obtenerEvaluacion, obtenerUsuariosAEvaluar, guardarEvaluacion, obtenerResultadoEvaluacion} from '../../controllers/EvaluacionController';

const router = Router();

// API url: /evaluacion

router.put('/preguntas', asignarPreguntasEvaluacion);
router.post('/asignar', asignarEvaluadores);
router.get('/evaluadores/:id', obtenerEvaluadores);
router.get('/usuarios/:id', obtenerUsuariosAEvaluar);
router.get('/:id', obtenerEvaluacion)
router.post('/respuestas', guardarEvaluacion);
router.get('/resultados/:id', obtenerResultadoEvaluacion)


// router.post('/equipo', createEvaluacionEquipo);
// router.post('/colaboradores', createEvaluacionCoolaboradores);
// router.get('/:id', getEvaluacion)

export default router;