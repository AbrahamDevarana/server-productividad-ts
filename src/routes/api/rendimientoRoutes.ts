import { Router } from 'express';

import { getRendimiento } from '../../controllers/RendimientoController'

const router = Router();

// API url: /rendimiento

router.get('/', getRendimiento);


export default router;