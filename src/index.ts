// express
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import passport from 'passport';
import cookieSession from 'express-session';
import fs from 'fs';
import dbConfig from './config/database';
import router from './routes';
import {socketService} from './services/socketService';
import dayjs from 'dayjs';
import quarterOfYear from 'dayjs/plugin/quarterOfYear'
import tz from 'dayjs/plugin/timezone'
dayjs.extend(tz)
dayjs.extend(quarterOfYear)
dayjs.tz.setDefault("America/Mexico_City")

require('dotenv').config();

import './services/googleService';

const COOKIE_SECRET = process.env.COOKIE_SECRET as string;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
    optionsSuccessStatus: 200
}));

app.use(cookieSession({
    secret: COOKIE_SECRET,
    name: 'productivity-app',
    resave: false,
    saveUninitialized: false,
    cookie: {
        sameSite: process.env.NODE_ENV === "production" ? 'none' : 'lax', // must be 'none' to enable cross-site delivery
        secure: process.env.NODE_ENV === "production", // must be true if sameSite='none'
        maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    },
}));


app.use(passport.initialize());
app.use(passport.session());

app.use('/api', router);

dbConfig.sync({
    // force: true
}).then(() => {

    console.log("Database connected");

}).catch((err) => {
    const errorinfo = `${new Date(Date.now()).toLocaleString()} - ${err} \n`
    console.log(err);
    fs.appendFile('src/logs/error.log', errorinfo, function (err) {
        if (err) throw err;
        process.exit(1);
    })
});

process.on('uncaughtException', (err) => {
    const errorinfo = `${new Date(Date.now()).toLocaleString()} - ${err} \n`
    console.log(err);
    fs.appendFile('src/logs/error.log', errorinfo, function (err) {
        if (err) throw err;
        process.exit(1);
    })
});

process.on('unhandledRejection', (err) => {
    const errorinfo = `${new Date(Date.now()).toLocaleString()} - ${err} \n`
    console.log(err);
    fs.appendFile('src/logs/error.log', errorinfo, function (err) {
        if (err) throw err;
        process.exit(1);
    })
});

const PORT = process.env.PORT || 5000 as unknown as number;
const HOST = process.env.HOST || "127.0.0.1" as unknown as string;

app.set('port', PORT);

const server =  app.listen(app.get('port'), HOST, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(server.address())
});


socketService(server)