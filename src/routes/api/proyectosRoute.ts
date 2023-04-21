import { Router } from 'express';
import { check } from 'express-validator';
import { validarCampos } from '../../middleware/validateFields';

import { createProyecto, getProyecto, getProyectos } from '../../controllers/ProyectosController'

const router = Router();

// API url: /proyectos

router.get('/', getProyectos);
router.get('/:id', getProyecto);
router.post('/', 
    [
        check('titulo', 'El titulo es obligatorio').not().isEmpty(),
        validarCampos
    ],
createProyecto);

export default router;