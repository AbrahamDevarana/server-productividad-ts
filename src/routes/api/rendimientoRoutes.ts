import { Router } from 'express';

import { getOrCreateRendimientoByUsuario } from '../../controllers/RendimientoController'

const router = Router();

// API url: /rendimiento

router.get('/', getOrCreateRendimientoByUsuario);


export default router;