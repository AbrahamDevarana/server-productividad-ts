import { Router } from 'express';
import { createCore, deleteCore, getCore, getCores, updateCore } from '../../controllers/CoreController';

const router = Router();


router.get('/:id', getCore);
router.get('/', getCores);
router.post('/', createCore);
router.put('/:id', updateCore);
router.delete('/:id', deleteCore);



export default router;