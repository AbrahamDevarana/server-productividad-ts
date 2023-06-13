import { Router } from 'express';
import { check } from 'express-validator';
import { validarCampos } from '../../middleware/validateFields';
import { updateSocial } from '../../controllers/SocialController';
const router = Router();



router.put('/', [
    check('url', 'La url es obligatoria').not().isEmpty(),
    validarCampos
], updateSocial)


export default router;

