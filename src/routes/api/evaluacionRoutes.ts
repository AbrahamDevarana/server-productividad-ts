import { Router } from 'express';
import { createEvaluacionCoolaboradores, createEvaluacionEquipo, asignarPreguntasEvaluacion, getEvaluacion, asignarEvaluadores, obtenerEvaluadores, obtenerEvaluacion, obtenerUsuariosAEvaluar, guardarEvaluacion} from '../../controllers/EvaluacionController';

const router = Router();

// API url: /evaluacion

router.put('/preguntas', asignarPreguntasEvaluacion);
router.post('/asignar', asignarEvaluadores);
router.get('/evaluadores/:id', obtenerEvaluadores);
router.get('/usuarios/:id', obtenerUsuariosAEvaluar);
router.get('/:id', obtenerEvaluacion)
router.post('/respuestas', guardarEvaluacion);


router.post('/equipo', createEvaluacionEquipo);
router.post('/colaboradores', createEvaluacionCoolaboradores);
router.get('/:id', getEvaluacion)

export default router;