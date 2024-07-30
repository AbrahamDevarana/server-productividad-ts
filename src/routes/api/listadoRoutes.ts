import { Router } from 'express';
import { createListado, getListados, deleteListado, updateListado } from '../../controllers/ListadoController'

const router = Router();

// API url: /listados

router.get('/', getListados);
router.post('/', createListado);
router.put('/:id', updateListado);
router.delete('/:id', deleteListado);

export default router;