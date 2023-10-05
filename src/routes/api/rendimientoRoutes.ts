import { Router } from 'express';

import { getHistorialRendimientoThunk, getOrCreateRendimientoByUsuario } from '../../controllers/RendimientoController'

const router = Router();

// API url: /rendimiento

router.get('/:usuarioId', getOrCreateRendimientoByUsuario);
router.get('/historial/:usuarioId', getHistorialRendimientoThunk);


export default router;