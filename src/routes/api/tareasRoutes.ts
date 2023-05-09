import { Router } from 'express';
import { check } from 'express-validator';
import { validarCampos } from '../../middleware/validateFields';
const router = Router();


import { getTarea, updateTarea, createTarea } from '../../controllers/TareasController';

router.get('/:id', getTarea);
router.put('/:id', updateTarea);

router.post('/', [
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('hitoId', 'El hitoId es obligatorio').not().isEmpty(),
], validarCampos, createTarea);








export default router;
