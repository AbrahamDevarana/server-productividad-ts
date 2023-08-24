import { Router } from 'express';
import { createEvaluacionCoolaboradores, createEvaluacionEquipo, updateEvaluacionPreguntas } from '../../controllers/EvaluacionController';

const router = Router();

// API url: /evaluacion

router.post('/equipo', createEvaluacionEquipo);
router.post('/colaboradores', createEvaluacionCoolaboradores);
router.put('/preguntas', updateEvaluacionPreguntas);

export default router;