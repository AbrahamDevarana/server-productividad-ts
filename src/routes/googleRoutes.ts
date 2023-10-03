import { Request, Response, Router } from "express";
import passport from "passport";
import { createAccessToken, createRefreshToken } from "../services/jwtService";
require('dotenv').config();

const router = Router();




router.get('/', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

router.get('/callback', passport.authenticate('google', {
    failureMessage: 'Error al iniciar sesión, porfavor intenta más tarde',
    failureRedirect: process.env.CLIENT_URL + '/error'
}), (req: Request, res: Response) => {
    const accessToken = createAccessToken(req.user);
    const refreshToken = createRefreshToken(req.user);    
    
    res.redirect(process.env.CLIENT_URL + '/success?accessToken=' + accessToken + '&refreshToken=' + refreshToken);

    
});

export default router;