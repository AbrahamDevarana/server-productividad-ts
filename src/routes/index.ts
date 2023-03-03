import { Router } from 'express';

import googleRoutes from './googleRoutes';
import authRoutes from './authRoutes';

import requireLogin from '../middleware/authMiddleware';
import apiRoutes from './apiRoutes';

const router = Router();

router.use('/login', googleRoutes)
router.use('/auth', authRoutes)
router.use('/', requireLogin, apiRoutes)

export default router;
