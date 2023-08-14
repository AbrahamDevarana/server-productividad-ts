import { Router } from 'express';
import { createEvaluacion, deleteEvaluacion, getEvaluacion, getEvaluaciones, updateEvaluacion } from '../../controllers/EvaluacionController';

const router = Router();


router.get('/', getEvaluaciones);
router.get('/:id', getEvaluacion);
router.post('/', createEvaluacion);
router.put('/:id', updateEvaluacion);
router.delete('/:id', deleteEvaluacion);

export default router;