import { Router } from 'express';
import { check } from 'express-validator';
import { validarCampos } from '../../middleware/validateFields';
import { createTask, deleteTask, getTask, updateTask} from '../../controllers/TaskController';
const router = Router();


router.get('/', getTask)

router.post('/', [
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('taskeableId', 'El resultado clave es obligatorio').not().isEmpty(),
    validarCampos
], createTask)

router.put('/:id', [
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('taskeableId', 'El resultado clave es obligatorio').not().isEmpty(),
    validarCampos
], updateTask)

router.delete('/:id', deleteTask)




export default router;
