import { Router } from 'express';
import { check } from 'express-validator';
import { validarCampos } from '../../middleware/validateFields';
const router = Router();


import { getAccionProyecto } from '../../controllers/AccionesProyectosController';

router.get('/:id', getAccionProyecto);








export default router;
