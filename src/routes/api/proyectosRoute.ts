import { Router } from 'express';
import { createProyecto, getProyecto, getProyectos, updateProyecto, deleteProyecto} from '../../controllers/ProyectosController'
import { checkAccess } from '../../middleware/checkAccess';

const router = Router();

// API url: /proyectos

router.get('/', getProyectos);
router.get('/:id', getProyecto);
router.post('/' ,createProyecto);

router.put('/:id', updateProyecto);

router.delete('/:id', deleteProyecto)




export default router;