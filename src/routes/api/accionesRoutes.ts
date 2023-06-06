import { Router } from 'express';
import { check } from 'express-validator';
import { validarCampos } from '../../middleware/validateFields';
import { getAcciones,  createAcciones, deleteAcciones, updateAcciones } from '../../controllers/AccionesController';
const router = Router();


router.get('/', getAcciones)

router.post('/', [
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('resultadoClaveId', 'El resultado clave es obligatorio').not().isEmpty(),
    validarCampos
], createAcciones)

router.put('/:id', [
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('resultadoClaveId', 'El resultado clave es obligatorio').not().isEmpty(),
    validarCampos
], updateAcciones)

router.delete('/:id', deleteAcciones)




export default router;
