import { Request, Response, Router } from "express";
import { OAuth2Client, UserRefreshClient } from "google-auth-library";
import passport from "passport";
require('dotenv').config();
const router = Router();

const oAuth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'postmessage'
  );


router.get('/', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

router.get('/callback', passport.authenticate('google', {
    failureMessage: 'Error al iniciar sesión, porfavor intenta más tarde',
    failureRedirect: '/login',
}), (req: Request, res: Response) => {
    res.redirect(process.env.CLIENT_URL + '/');
});


// router.post('/google', async (req: Request, res: Response) => {
//     const { tokens } = await oAuth2Client.getToken(req.body.code); // exchange code for tokens
//     console.log(tokens);
  
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