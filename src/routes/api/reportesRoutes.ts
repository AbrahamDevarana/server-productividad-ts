import { Router } from 'express';
import { generarReporteRendimiento, obtenerRendimiento } from '../../controllers/ReportesController';

const router = Router();


// /api/reportes

router.get('/usuarios', obtenerRendimiento);
router.get('/usuarios/generar', generarReporteRendimiento);

export default router;