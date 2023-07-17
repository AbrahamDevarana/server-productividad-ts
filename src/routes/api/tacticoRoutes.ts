import { Router } from 'express';
import { getTacticos, createTactico, deleteTactico, getTactico, updateTactico, getTacticosByArea, getTacticosByEstrategia, getTacticosByEquipos, updateQuarters} from '../../controllers/TacticoController';

const router = Router();

router.get('/', getTacticos);
router.get('/:id', getTactico);
router.post('/', createTactico);
router.put('/:id', updateTactico);
router.patch('/quarters/:id', updateQuarters);

router.delete('/:id', deleteTactico);


router.get('/area/:slug', getTacticosByArea)
router.get('/estrategia/:estrategiaId', getTacticosByEstrategia)

router.get('/area/equipos/:slug', getTacticosByEquipos)
export default router;