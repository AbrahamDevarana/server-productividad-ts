import { Router } from 'express';
import { getUsuario, getUsuarios } from '../../controllers/UsuarioContoller';
import { check } from 'express-validator';
const router = Router();


router.get('/', getUsuarios);
router.get('/:id', getUsuario);
router.post('/', [
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('apellidoPaterno', 'El apellido paterno es obligatorio').not().isEmpty(),
    check('apellidoMaterno', 'El apellido materno es obligatorio').not().isEmpty(),
    check('email', 'El email es obligatorio').isEmail(),
], getUsuarios);
router.put('/:id', [
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('apellidoPaterno', 'El apellido paterno es obligatorio').not().isEmpty(),
    check('apellidoMaterno', 'El apellido materno es obligatorio').not().isEmpty(),
    check('email', 'El email es obligatorio').isEmail(),
], getUsuarios);
router.delete('/:id', getUsuarios);


export default router;