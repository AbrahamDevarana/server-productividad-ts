import { Router } from 'express';
import { check } from 'express-validator';
import { validarCampos } from '../../middleware/validateFields';
import { getOperativos, createOperativo, updateOperativo, getObjetivo as getOperativo } from '../../controllers/OperativoController'

const router = Router();

// API url: /operativos

router.get('/', getOperativos);


router.get('/:id', getOperativo);



router.post('/', [
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('meta', 'La meta es obligatoria').not().isEmpty(),
    check('indicador', 'El indicador es obligatorio').not().isEmpty(),
    check('fechaInicio', 'La fecha de inicio es obligatoria').not().isEmpty(),
    check('fechaFin', 'La fecha de fin es obligatoria').not().isEmpty(),
    validarCampos
], createOperativo);

router.put('/:id', [
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('meta', 'La meta es obligatoria').not().isEmpty(),
    check('indicador', 'El indicador es obligatorio').not().isEmpty(),
    check('fechaInicio', 'La fecha de inicio es obligatoria').not().isEmpty(),
    check('fechaFin', 'La fecha de fin es obligatoria').not().isEmpty(),
    validarCampos
], updateOperativo);




export default router;

