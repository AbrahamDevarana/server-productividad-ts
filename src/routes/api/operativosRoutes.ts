import { Router } from 'express';
import { getOperativos, createOperativo, updateOperativo, getOperativo, setPonderaciones, deleteOperativo } from '../../controllers/OperativoController'

const router = Router();

// API url: /operativos

router.get('/', getOperativos);
router.get('/:id', getOperativo);
router.post('/', createOperativo);
router.put('/:id', updateOperativo);
router.delete('/:id', deleteOperativo);

router.put('/set-ponderaciones/:id', setPonderaciones);






export default router;

