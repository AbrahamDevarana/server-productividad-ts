import { Router } from 'express';
import { check } from 'express-validator';
import { createPerspectiva, deletePerspectiva, getPerspectiva, getPerspectivas, updatePerspectiva } from '../../controllers/PerspectivaController';
import { validarCampos } from '../../middleware/validateFields';
const router = Router();

router.get('/', getPerspectivas);

router.get('/:id', getPerspectiva);

router.post('/', [
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    validarCampos
], createPerspectiva);

router.put('/:id', [
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    validarCampos
], updatePerspectiva);

router.delete('/:id', deletePerspectiva);

export default router;