import { Router } from 'express';
import {createHstorial, getHistorial}  from '../../controllers/HistorialPerformanceController';

const router = Router();

router.post('/', createHstorial);

router.get('/:year', getHistorial);

export default router;
