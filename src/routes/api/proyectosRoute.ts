import { Router } from 'express';
import { check } from 'express-validator';
import { validarCampos } from '../../middleware/validateFields';

import { createProyecto, getProyecto, getProyectos, updateProyecto, } from '../../controllers/ProyectosController'
import { checkAccess } from '../../middleware/checkAccess';

const router = Router();

// API url: /proyectos

router.get('/', getProyectos);
router.get('/:id', getProyecto);
router.post('/', createProyecto);

router.put('/:id', updateProyecto);



export default router;