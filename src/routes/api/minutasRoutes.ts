import {Router} from 'express';

import {getMinutas, getMinuta, createMinuta, deleteMinuta, updateMinuta} from '../../controllers/MinutaController';

const router = Router();

router.get('/', getMinutas);
router.get('/:id', getMinuta);
router.post('/', createMinuta);
router.put('/:id', updateMinuta);
router.delete('/:id', deleteMinuta);


export default router;