import { Router } from 'express';
import { getOperativos, createOperativo, updateOperativo, getOperativo, setPonderaciones, deleteOperativo, cerrarObjetivo } from '../../controllers/OperativoController'

const router = Router();

// API url: /operativos

router.get('/', getOperativos);
router.get('/:id', getOperativo);
router.post('/', createOperativo);
router.put('/:id', updateOperativo);
router.delete('/:id', deleteOperativo);
router.get('/cierre/:id', cerrarObjetivo);

router.put('/set-ponderaciones/:id', setPonderaciones);






export default router;

