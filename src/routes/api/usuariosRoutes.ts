import { Router } from 'express';
import { check } from 'express-validator';
import { getUsuario, getUsuarios, createUsuario, updateUsuario, deleteUsuario, uploadPhoto } from '../../controllers/UsuarioContoller';
import { validarCampos } from '../../middleware/validateFields';
const router = Router();


router.get('/', getUsuarios);
router.get('/:id', getUsuario);
router.post('/', [
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('apellidoPaterno', 'El apellido paterno es obligatorio').not().isEmpty(),
    check('apellidoMaterno', 'El apellido materno es obligatorio').not().isEmpty(),
    check('email', 'El email es obligatorio').isEmail(),
    validarCampos
], createUsuario);
router.put('/:id', [
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('apellidoPaterno', 'El apellido paterno es obligatorio').not().isEmpty(),
    check('apellidoMaterno', 'El apellido materno es obligatorio').not().isEmpty(),
    check('email', 'El email es obligatorio').isEmail(),
    validarCampos
], updateUsuario);
router.delete('/:id', deleteUsuario);

router.post('/upload/:id', uploadPhoto);


export default router;