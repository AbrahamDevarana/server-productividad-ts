import { Router } from 'express';
import { getGaleriaDevarana } from '../../controllers/GaleriaController';

const router = Router();

router.get('/devarana', getGaleriaDevarana);

export default router;