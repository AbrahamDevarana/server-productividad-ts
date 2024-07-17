import { Router } from 'express';
import { createComentario, getComentarios, deleteComentario } from '../../controllers/ComentariosController'

const router = Router();

// API url: /comentarios

router.get('/', getComentarios);

router.post('/', createComentario);

router.delete('/:id', deleteComentario);

export default router;
