import { Router } from 'express';
import { createComentario, getComentarios } from '../../controllers/ComentariosController'

const router = Router();

// API url: /comentarios

router.get('/', getComentarios);

router.post('/', createComentario);

export default router;
