import { Router } from 'express';
import { createTactico, deleteTactico, getTactico, updateTactico, getTacticosByArea, getTacticosByEstrategia, getTacticosByEquipos, updateQuarters, getTacticos} from '../../controllers/TacticoController';

const router = Router();

router.get('/equipo', getTacticosByEquipos)
router.get('/area/:slug', getTacticosByArea)
router.put('/quarters/:id', updateQuarters);
router.get('/estrategia/:estrategiaId', getTacticosByEstrategia)

router.get('/:id', getTactico);
router.get('/', getTacticos);
router.post('/', createTactico);
router.put('/:id', updateTactico);
router.delete('/:id', deleteTactico);




export default router;