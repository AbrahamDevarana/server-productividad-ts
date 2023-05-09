import { Router } from 'express';
import { check } from 'express-validator';
import { validarCampos } from '../../middleware/validateFields';
import { getHitos, createHito, deleteHito, updateHito } from '../../controllers/HitosController';

const router = Router();

router.get('/', getHitos);

router.post('/', createHito);

router.put('/:id', [
    check('titulo', 'El titulo es obligatorio').not().isEmpty(),
    ],
    updateHito
);

router.delete('/:id', deleteHito);

export default router;



