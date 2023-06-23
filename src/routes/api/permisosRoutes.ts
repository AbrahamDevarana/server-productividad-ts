import { Router } from 'express';
import { createPermiso, deletePermiso, getPermiso, getPermisos, updatePermiso } from '../../controllers/PermisosController'

const router = Router();

// API url: /roles

router.get('/',getPermisos);

router.get('/:id', getPermiso);

router.post('/', createPermiso);

router.put('/:id', updatePermiso);

router.delete('/:id', deletePermiso);


export default router;