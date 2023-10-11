import { Router } from 'express';
import { getOperativos, createOperativo, updateOperativo, getOperativo, setPonderaciones, deleteOperativo, cerrarObjetivo, cierreCiclo, aprovacionObjetivo } from '../../controllers/OperativoController'

const router = Router();

// API url: /operativos

router.get('/', getOperativos);
router.get('/:id', getOperativo);
router.post('/', createOperativo);
router.put('/:id', updateOperativo);
router.delete('/:id', deleteOperativo);
router.post('/cierre', cerrarObjetivo);
router.post('/cierre-ciclo', cierreCiclo);
// /cierre-objetivo-lider
router.post('/cierre-objetivo-lider', aprovacionObjetivo);

router.put('/set-ponderaciones/:id', setPonderaciones);






export default router;

