import { Router } from 'express';
import { check } from 'express-validator';
import { getTacticos, createTactico, deleteTactico, getTactico, updateTactico, getTacticosByArea, getTacticosByEstrategia } from '../../controllers/TacticoController';
import { validarCampos } from '../../middleware/validateFields';
const router = Router();

router.get('/', getTacticos);
router.get('/:id', getTactico);
router.post('/', [
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('fechaInicio', 'La fecha de inicio es obligatoria').not().isEmpty(),
    check('fechaFin', 'La fecha de fin es obligatoria').not().isEmpty(),
    check('tipoObjetivo', 'El tipo de objetivo es obligatorio').not().isEmpty(),
    validarCampos
], createTactico);
router.put('/:id', [
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('fechaInicio', 'La fecha de inicio es obligatoria').not().isEmpty(),
    check('fechaFin', 'La fecha de fin es obligatoria').not().isEmpty(),
    check('tipoObjetivo', 'El tipo de objetivo es obligatorio').not().isEmpty(),
    validarCampos
], updateTactico);

router.delete('/:id', deleteTactico);


router.get('/area/:slug', getTacticosByArea)
router.get('/estrategia/:estrategiaId', getTacticosByEstrategia)
export default router;