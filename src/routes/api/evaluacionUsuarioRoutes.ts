import { Router } from 'express';
import {createEvaluacionByUsuario, createEvaluacionRandom, getEvaluacionesByUsuario } from '../../controllers/EvaluacionUsuarioController';

const router = Router();

router.get('/:id', getEvaluacionesByUsuario);
router.post('/', createEvaluacionByUsuario);
router.post('/random', createEvaluacionRandom);

export default router;