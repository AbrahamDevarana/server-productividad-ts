
import { Router } from 'express';
import { createEvaluacionPregunta, deleteEvaluacionPregunta, getEvaluacionPregunta, getEvaluacionPreguntas, updateEvaluacionPregunta } from '../../controllers/EvaluacionPreguntasController';

const router = Router();


router.get('/', getEvaluacionPreguntas);
router.get('/:id', getEvaluacionPregunta);
router.post('/', createEvaluacionPregunta);
router.put('/:id', updateEvaluacionPregunta);
router.delete('/:id', deleteEvaluacionPregunta);



export default router;