import { Router } from 'express';
import { check } from 'express-validator';
import { validarCampos } from '../../middleware/validateFields';
import {createResultadosClave, deleteResultadosClave, getResultadosClave, updateResultadosClave} from '../../controllers/ResultadosController';
const router = Router();



router.get('/', getResultadosClave);
router.post('/', [
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('propietarioId', 'El propietario es obligatorio').not().isEmpty(),
    check('operativoId', 'El operativo es obligatorio').not().isEmpty(),
    check('status', 'El status es obligatorio').not().isEmpty(),
    validarCampos
], createResultadosClave);
router.put('/:id', [
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('propietarioId', 'El propietario es obligatorio').not().isEmpty(),
    check('operativoId', 'El operativo es obligatorio').not().isEmpty(),
    check('status', 'El status es obligatorio').not().isEmpty(),
    validarCampos
], updateResultadosClave);

router.delete('/:id', deleteResultadosClave);




export default router;
