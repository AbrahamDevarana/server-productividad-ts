import { Router } from "express";
import { getCreditos, getCreditosByUserId, updateCreditos, renovateCreditos } from "../../controllers/CreditosController";

const router = Router();




router.get('/', getCreditos);
// router.get('/:userId', getCreditosByUserId);
// router.put('/:userId', updateCreditos);
// router.post('/renovate', renovateCreditos);


export default router;