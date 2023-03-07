import { Router } from 'express';
import { check } from 'express-validator';
import { getArea, getAreas} from '../../controllers/AreaController';
const router = Router();


router.get('/', getAreas);
router.get('/:id', getArea);





export default router;
