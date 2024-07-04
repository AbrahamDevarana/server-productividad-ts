import { Router } from 'express';
import { createProyecto, getProyecto, getProyectos, updateProyecto, deleteProyecto} from '../../controllers/ProyectosController'
import { checkAccess } from '../../middleware/checkAccess';

const router = Router();

// API url: /proyectos

router.get('/', checkAccess('ver proyectos'), getProyectos);
router.get('/:id', getProyecto);
router.post('/', checkAccess('crear proyectos') ,createProyecto);

router.put('/:id', updateProyecto);

router.delete('/:id', checkAccess('eliminar proyectos'), deleteProyecto)




export default router;