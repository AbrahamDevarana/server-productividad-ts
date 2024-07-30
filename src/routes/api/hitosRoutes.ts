import { Router } from 'express';
import { check } from 'express-validator';
import { getHitos, createHito, deleteHito, updateHito, duplicateHito } from '../../controllers/HitosController';

const router = Router();

router.get('/', getHitos);

router.post('/', createHito);

router.put('/:id', [
    check('titulo', 'El titulo es obligatorio').not().isEmpty(),
    ],
    updateHito
);

router.delete('/:id', deleteHito);

router.post('/duplicate', duplicateHito);

export default router;



