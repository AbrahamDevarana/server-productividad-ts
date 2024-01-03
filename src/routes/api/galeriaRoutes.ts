import { Router } from 'express';
import { getGaleriaDevarana, getGaleriaUsuario, uploadGaleriaUsuario, deleteGaleriaUsuario } from '../../controllers/GaleriaController';

const router = Router();

router.get('/devarana', getGaleriaDevarana);
router.get('/usuario', getGaleriaUsuario);
router.post('/usuario', uploadGaleriaUsuario);
router.delete('/usuario/:id', deleteGaleriaUsuario );


export default router;