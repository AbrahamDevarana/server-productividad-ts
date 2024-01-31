import { Router } from 'express';
import { getOperativos, createOperativo, updateOperativo, getOperativo, setPonderaciones, deleteOperativo, statusObjetivo, cierreCiclo, aprovacionObjetivo, copyOperativo} from '../../controllers/OperativoController'

const router = Router();

// API url: /operativos

router.get('/', getOperativos);
router.get('/:id', getOperativo);
router.post('/', createOperativo);
router.put('/:id', updateOperativo);
router.delete('/:id', deleteOperativo);
router.post('/cierre', statusObjetivo);
router.post('/cierre-ciclo', cierreCiclo);
// /cierre-objetivo-lider
router.post('/cierre-objetivo-lider', aprovacionObjetivo);

router.put('/set-ponderaciones/:id', setPonderaciones);

router.post('/copy', copyOperativo)





export default router;

