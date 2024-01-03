import { Router } from 'express';
import { createTactico, deleteTactico, getTactico, updateTactico, getTacticosByEstrategia, getTacticosByEquipo, getTacticosCoreByEquipo, changeTypeTactico, changeTypeProgress} from '../../controllers/TacticoController';

const router = Router();

// router.get('/equipo', getTacticosByEquipos)
// router.get('/objetivo/:estrategicoId', getTacticosByObjetivoEstrategico)


router.get('/byEstrategia', getTacticosByEstrategia);
router.get('/byEquipo', getTacticosByEquipo);
router.get('/byEquipoCore', getTacticosCoreByEquipo);
router.put('/changeType', changeTypeTactico);
router.put('/changeTypeProgress', changeTypeProgress);
router.get('/:id', getTactico);
router.post('/', createTactico);
router.put('/:id', updateTactico);
router.delete('/:id', deleteTactico);




export default router;