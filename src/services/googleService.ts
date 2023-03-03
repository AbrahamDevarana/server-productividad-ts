import { Usuarios } from "../models";
require ('dotenv').config();
import passport from "passport";
import GoogleStrategy from 'passport-google-oauth20';

const googleAuth = new GoogleStrategy.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID as string,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    callbackURL: process.env.GOOGLE_CALLBACK_URL as string,
    }, async (accessToken: any, refreshToken: any, profile: any, done: any) => {
        const email = profile.emails[0].value;
        const user = await Usuarios.findOne({ where: { email } });

        if (user) {
            await Usuarios.update({
                googleId: profile.id,
            }, {
                where: { email }
            });
            // success
            return done(null, user);
        }else{
            // error
            return done(null, false);
        }
    }
);


passport.use(googleAuth);

passport.serializeUser((user: any, done: any) => {
    done(null, user);
});

passport.deserializeUser((user: any, done: any) => {
    done(null, user);
});