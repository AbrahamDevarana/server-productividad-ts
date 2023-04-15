import { Router } from 'express';
import { check } from 'express-validator';
import { validarCampos } from '../../middleware/validateFields';
import {createResultadosClave, deleteResultadosClave, getResultadosClave, updateResultadosClave, getResultadoClave } from '../../controllers/ResultadosController';
const router = Router();



router.get('/', getResultadosClave);
router.get('/:id', getResultadoClave);
router.post('/', [
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('propietarioId', 'El propietario es obligatorio').not().isEmpty(),
    check('operativoId', 'El operativo es obligatorio').not().isEmpty(),
    validarCampos
], createResultadosClave);
router.put('/:id', [
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('propietarioId', 'El propietario es obligatorio').not().isEmpty(),
    check('operativoId', 'El operativo es obligatorio').not().isEmpty(),
    validarCampos
], updateResultadosClave);

router.delete('/:id', deleteResultadosClave);




export default router;
