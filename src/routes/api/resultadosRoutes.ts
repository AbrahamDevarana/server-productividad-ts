import { Router } from 'express';
import { check } from 'express-validator';
import { validarCampos } from '../../middleware/validateFields';
import {createResultadosClave, deleteResultadosClave, getResultadosClave, updateResultadosClave, getResultadoClave, duplicateResultadoClave } from '../../controllers/ResultadosController';
const router = Router();



router.get('/', getResultadosClave);
router.get('/:id', getResultadoClave);
router.post('/', [
    check('operativoId', 'El operativo es obligatorio').not().isEmpty(),
    validarCampos
], createResultadosClave);
router.put('/:id', [
    check('operativoId', 'El operativo es obligatorio').not().isEmpty(),
    validarCampos
], updateResultadosClave);

router.delete('/:id', deleteResultadosClave);

router.post('/duplicate', duplicateResultadoClave);





export default router;
