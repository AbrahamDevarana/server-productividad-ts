import { Router } from 'express';
import { obtenerRendimientoUsuarios } from '../../controllers/ReportesController';

const router = Router();


// /api/reportes

router.get('/usuarios', obtenerRendimientoUsuarios);

export default router;