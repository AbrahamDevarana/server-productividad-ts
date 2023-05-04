import { Router } from 'express';
import { check } from 'express-validator';
import { uploadProyectoBanner, uploadUsuarioAvatar } from '../../controllers/UploadController'
const router = Router();

// API url: /upload

router.post('/proyecto/:id', uploadProyectoBanner);
router.post('/usuario/:id', uploadUsuarioAvatar);

export default router;