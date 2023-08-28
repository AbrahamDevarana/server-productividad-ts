import { Router } from 'express';
import { getOperativos, createOperativo, updateOperativo, getOperativo as getOperativo, getOperativosByUsuario, setPonderaciones } from '../../controllers/OperativoController'

const router = Router();

// API url: /operativos

router.get('/usuario', getOperativosByUsuario)

router.get('/', getOperativos);
router.get('/:id', getOperativo);
router.post('/', createOperativo);
router.put('/:id', updateOperativo);

router.put('/set-ponderaciones/:id', setPonderaciones);






export default router;

