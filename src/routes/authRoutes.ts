import { Router } from "express";
require('dotenv').config();
const router = Router();
import { Request, Response } from "express";
import { sessionValidate, refreshAccessToken } from "../controllers/AuthController";



// router.get('/validate', isUserAuthenticated, getAccessToken )
router.get('/validate', sessionValidate )


router.get('/logout', ( req: Request, res: Response ) => {
    res.clearCookie('connect.sid')
    res.status(200).json({ message: 'Has cerrado sesión correctamente'})
})


router.post('/refresh-access-token', () => refreshAccessToken )

export default router;
