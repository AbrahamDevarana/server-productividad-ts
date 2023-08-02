import { Router } from 'express';
import { check } from 'express-validator';
import { getUsuario, getUsuarios, createUsuario, updateUsuario, deleteUsuario, uploadPhoto, deletePhoto, getPerfil, updatePerfil, uploadConfiguracion, resultadosUsuarios} from '../../controllers/UsuarioContoller';
import { validarCampos } from '../../middleware/validateFields';
const router = Router();



router.get('/resultados', resultadosUsuarios)

router.get('/', getUsuarios);
router.get('/:id', getUsuario);
router.get('/perfil/:slug', getPerfil);
router.put('/config', uploadConfiguracion);

router.post('/', [
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('apellidoPaterno', 'El apellido paterno es obligatorio').not().isEmpty(),
    check('email', 'El email es obligatorio').isEmail(),
    validarCampos
], createUsuario);


router.put('/:id', updateUsuario);
router.delete('/:id', deleteUsuario);

router.post('/upload/:id', uploadPhoto);
router.delete('/delete-photo/:id', deletePhoto);



router.put('/perfil/:id', updatePerfil);







export default router;