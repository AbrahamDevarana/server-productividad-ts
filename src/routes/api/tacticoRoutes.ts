import { Router } from 'express';
import { createTactico, deleteTactico, getTactico, updateTactico, getTacticos} from '../../controllers/TacticoController';

const router = Router();

// router.get('/equipo', getTacticosByEquipos)
// router.get('/objetivo/:estrategicoId', getTacticosByObjetivoEstrategico)


router.get('/:id', getTactico);
router.get('/', getTacticos);
router.post('/', createTactico);
router.put('/:id', updateTactico);
router.delete('/:id', deleteTactico);




export default router;