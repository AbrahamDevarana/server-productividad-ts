
import { Router } from 'express';
import { getPerfil, updatePerfil, getColaboradores, getEquipo } from '../../controllers/PerfilController';

const router = Router();

router.get('/get-equipo/:id', getEquipo);
router.get('/get-colaboradores/:id', getColaboradores);

router.get('/:slug', getPerfil);
router.put('/:id', updatePerfil);


export default router;