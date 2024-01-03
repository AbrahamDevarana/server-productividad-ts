import { Router } from 'express';
import { check } from 'express-validator';
import { validarCampos } from '../../middleware/validateFields';
import { createObjetivoEstrategico, deleteObjetivoEstrategico, getObjetivoEstrategico, getObjetivosEstrategicos, updateObjetivoEstrategico, getObjetivosEstrategicoByArea, changeTypeProgress } from '../../controllers/EstrategicoController'
const router = Router();

// API url: /estrategicos

// router.get('/byPerspectiva/:id', getObjetivosEstrategicoByPerspectiva);
router.get('/byArea', getObjetivosEstrategicoByArea)

router.delete('/:id', deleteObjetivoEstrategico);


router.get('/', getObjetivosEstrategicos);
router.get('/:id', getObjetivoEstrategico);

router.post('/', [ validarCampos ], createObjetivoEstrategico);

router.put('/changeTypeProgress', changeTypeProgress);

router.put('/:id', [
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    validarCampos
], updateObjetivoEstrategico);


export default router;

