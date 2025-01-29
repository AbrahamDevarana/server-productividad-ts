import { Router } from 'express';
import { generarReporteRendimientoExcel, obtenerRendimiento, generateReport } from '../../controllers/ReportesController';

const router = Router();


// /api/reportes

router.get('/usuarios', obtenerRendimiento);
router.get('/usuarios/generar', generarReporteRendimientoExcel);
router.post('/generate-report', generateReport )

export default router;