import { Router } from 'express';
import { createComite, getComite, getComites, updateComite, deleteComite} from '../../controllers/ComiteController'
import { checkAccess } from '../../middleware/checkAccess';

const router = Router();

// API url: /comites

router.get('/', getComites);
router.get('/:id', getComite);
router.post('/', createComite);
router.put('/:id', updateComite);
router.delete('/:id', deleteComite)


export default router;