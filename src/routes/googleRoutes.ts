import { Request, Response, Router } from "express";
import { OAuth2Client, UserRefreshClient } from "google-auth-library";
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

    console.log(req.user);
    

    const accessToken = createAccessToken(req.user);
    const refreshToken = createRefreshToken(req.user);    
    
    res.redirect(process.env.CLIENT_URL + '/success?accessToken=' + accessToken + '&refreshToken=' + refreshToken);

    
});



// const oAuth2Client = new OAuth2Client(
//     process.env.GOOGLE_CLIENT_ID,
//     process.env.GOOGLE_CLIENT_SECRET,
//     'postmessage'
// );

// router.post('/google', async (req: Request, res: Response) => {
//     const { tokens } = await oAuth2Client.getToken(req.body.code); // exchange code for tokens  
//     res.json(tokens);
// });

// router.post('/google/refresh-token', async (req, res) => {
//     const user = new UserRefreshClient(
//       req.body.refreshToken,
//     );
//     const { credentials } = await user.refreshAccessToken(); // optain new tokens
//     res.json(credentials);
//   })

export default router;