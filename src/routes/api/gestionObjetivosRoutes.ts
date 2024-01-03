import { Router } from 'express';
import { getOrCreateGestionObjetivos, updateGestionObjetivos } from '../../controllers/GestionObjetivosController';



const router = Router();

router.put('/:id', updateGestionObjetivos);
router.get('/', getOrCreateGestionObjetivos);

export default router;