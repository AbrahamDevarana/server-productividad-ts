import { Request, Response, Router } from "express";
import passport from "passport";
require('dotenv').config();
const router = Router();


router.get('/', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

router.get('/callback', passport.authenticate('google', {
    failureMessage: 'Error al iniciar sesión, porfavor intenta más tarde',
    failureRedirect: '/login',
}), (req: Request, res: Response) => {
    res.redirect(process.env.CLIENT_URL + '/');
});


export default router;