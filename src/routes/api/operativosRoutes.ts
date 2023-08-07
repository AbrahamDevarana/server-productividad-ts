import { Router } from 'express';
import { check } from 'express-validator';
import { validarCampos } from '../../middleware/validateFields';
import { getOperativos, createOperativo, updateOperativo, getOperativo as getOperativo } from '../../controllers/OperativoController'

const router = Router();

// API url: /operativos

router.get('/', getOperativos);
router.get('/:id', getOperativo);
router.post('/', createOperativo);
router.put('/:id', updateOperativo);




export default router;

