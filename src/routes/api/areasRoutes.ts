import { Router } from 'express';
import { check } from 'express-validator';
import { getArea, getAreas, createArea, updateArea, deleteArea} from '../../controllers/AreaController';
import { validarCampos } from '../../middleware/validateFields';
const router = Router();


router.get('/', getAreas);
router.get('/:id', getArea);

router.post('/', [
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    validarCampos
], createArea);

router.put('/:id', [
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    validarCampos
], updateArea);

router.delete('/:id', deleteArea);







export default router;
