
import { Router } from 'express';
import { getPerfil, updatePerfil } from '../../controllers/PerfilController';

const router = Router();


router.get('/perfil/:slug', getPerfil);
router.put('/perfil/:id', updatePerfil);

export default router;