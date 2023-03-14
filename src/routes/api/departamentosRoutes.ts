import { Router } from 'express';
import { check } from 'express-validator';
import { validarCampos } from '../../middleware/validateFields';
import { getDepartamento, getDepartamentos, createDepartamento, updateDepartamento, deleteDepartamento, getLideresByDepartamento} from '../../controllers/DepartamentoController';

const router = Router();

router.get('/', getDepartamentos);
router.get('/:id', getDepartamento);

router.post('/', [
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    validarCampos
], createDepartamento);

router.put('/:id', [
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    validarCampos
], updateDepartamento);

router.delete('/:id', deleteDepartamento);

router.get('/getLeader/:id', getLideresByDepartamento);

export default router;
