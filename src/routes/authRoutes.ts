import { Router } from "express";
require('dotenv').config();
const router = Router();
import { Request, Response } from "express";
import { createAccessToken, createRefreshToken } from '../services/jwtService';
import { getAccessToken, refreshAccessToken } from "../controllers/AuthController";
import isUserAuthenticated from '../middleware/loginMiddleware.';


router.get('/validate', isUserAuthenticated, getAccessToken )

router.get('/logout', ( req:Request, res:Response ) => {
    res.clearCookie('connect.sid')
    res.status(200).json({ message: 'Has cerrado sesión correctamente'})
})

router.get('/', 
    isUserAuthenticated,
    (req:Request, res:Response) => {    
    if (req.user) {
        const accessToken = createAccessToken(req.user);
        const refreshToken = createRefreshToken(req.user);

        res.status(200).json({ accessToken, refreshToken });
    }else{
        res.status(401).json({ message: 'No has iniciado sesión' })
    }
})


router.post('/refresh-access-token', (req:Request, res:Response) => refreshAccessToken )

export default router;
