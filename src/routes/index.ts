import { Router } from 'express';

import googleRoutes from './googleRoutes';
import authRoutes from './authRoutes';

import requireLogin from '../middleware/authMiddleware';
import apiRoutes from './apiRoutes';
import endpoints from './endPoints';

const router = Router();

router.use('/login', googleRoutes)
router.use('/auth', authRoutes)
router.use('/ext', requireLogin, endpoints)
router.use('/', requireLogin, apiRoutes)

router.get('/webhooks', (req, res) => {
    console.log(req.body);
    res.send('ok');
})
    

export default router;
