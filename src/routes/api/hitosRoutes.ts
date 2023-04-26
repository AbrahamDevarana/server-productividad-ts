import { Router } from 'express';
import { check } from 'express-validator';
import { validarCampos } from '../../middleware/validateFields';
import { getHitos, createHito, deleteHito, updateHito } from '../../controllers/HitosController';

const router = Router();

router.get('/', getHitos);

router.post('/', [
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    ],
    createHito
);

router.put('/:id', [
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    ],
    updateHito
);

router.delete('/:id', deleteHito);

export default router;



