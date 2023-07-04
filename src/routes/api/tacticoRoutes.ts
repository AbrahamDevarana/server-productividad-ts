import { Router } from 'express';
import { check } from 'express-validator';
import { getTacticos, createTactico, deleteTactico, getTactico, updateTactico, getTacticosByArea, getTacticosByEstrategia } from '../../controllers/TacticoController';
import { validarCampos } from '../../middleware/validateFields';
const router = Router();

router.get('/', getTacticos);
router.get('/:id', getTactico);
router.post('/', createTactico);
router.put('/:id', updateTactico);

router.delete('/:id', deleteTactico);


router.get('/area/:slug', getTacticosByArea)
router.get('/estrategia/:estrategiaId', getTacticosByEstrategia)
export default router;