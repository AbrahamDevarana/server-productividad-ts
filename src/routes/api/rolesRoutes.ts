import { Router } from 'express';

import { getRoles, createRol, deleteRol, getRol, updateRol} from '../../controllers/RolesController'


const router = Router();

// API url: /roles

router.get('/', getRoles);

router.get('/:id', getRol);

router.post('/', createRol);

router.put('/:id', updateRol);

router.delete('/:id', deleteRol);


export default router;