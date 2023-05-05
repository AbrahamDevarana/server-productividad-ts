import { Router } from 'express';
import { check } from 'express-validator';
import { validarCampos } from '../../middleware/validateFields';
const router = Router();


import { getTarea, updateTarea } from '../../controllers/TareasController';

router.get('/:id', getTarea);
router.put('/:id', updateTarea);







export default router;
