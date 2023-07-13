import { Router } from 'express';
import { check } from 'express-validator';
import { validarCampos } from '../../middleware/validateFields';
import { getArea, getAreas, createArea, updateArea, deleteArea, getAreaObjetivos} from '../../controllers/AreaController';
const router = Router();


router.get('/', getAreas);
router.get('/:id', getArea);
router.get('/getObjetivos/:id', getAreaObjetivos);

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
