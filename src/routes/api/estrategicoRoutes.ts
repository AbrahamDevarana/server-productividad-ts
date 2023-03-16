import { Router } from 'express';
import { check } from 'express-validator';
import { validarCampos } from '../../middleware/validateFields';
import { createObjetivoEstrategico, deleteObjetivoEstrategico, getObjetivoEstrategico, getObjetivosEstrategicos, updateObjetivoEstrategico, getObjetivosEstrategicoByPerspectiva } from '../../controllers/EstrategicoController'
const router = Router();

// API url: /estrategicos

router.get('/', getObjetivosEstrategicos);
router.get('/:id', getObjetivoEstrategico);

router.post('/', [
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    validarCampos
], createObjetivoEstrategico);

router.put('/:id', [
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    validarCampos
], updateObjetivoEstrategico);

router.get('/byPerspectiva/:id', getObjetivosEstrategicoByPerspectiva);

router.delete('/:id', deleteObjetivoEstrategico);

export default router;

