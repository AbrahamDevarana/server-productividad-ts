import { Router } from 'express';

import { getHistorialRendimientoThunk, getOrCreateRendimientoByUsuario } from '../../controllers/RendimientoController'
import { getRanking } from '../../controllers/ResultadosController';

const router = Router();

// API url: /rendimiento

router.get('/avance/:usuarioId', getOrCreateRendimientoByUsuario);
router.get('/historial/:usuarioId', getHistorialRendimientoThunk);
router.get('/ranking', getRanking);


export default router;