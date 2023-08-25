import { Router } from 'express';
import { createEvaluacionCoolaboradores, createEvaluacionEquipo, updateEvaluacionPreguntas, getEvaluacion } from '../../controllers/EvaluacionController';

const router = Router();

// API url: /evaluacion

router.post('/equipo', createEvaluacionEquipo);
router.post('/colaboradores', createEvaluacionCoolaboradores);
router.put('/preguntas', updateEvaluacionPreguntas);
router.get('/', getEvaluacion)

export default router;