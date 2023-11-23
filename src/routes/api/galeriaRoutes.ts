import { Router } from 'express';
import { getGaleriaDevarana, getGaleriaUsuario, uploadGaleriaUsuario   } from '../../controllers/GaleriaController';

const router = Router();

router.get('/devarana', getGaleriaDevarana);
router.get('/usuario', getGaleriaUsuario);
router.post('/usuario', uploadGaleriaUsuario);


export default router;