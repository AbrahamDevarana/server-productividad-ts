import jwt from 'jsonwebtoken';
import moment from 'moment';
const JWT_SECRET = process.env.JWT_SECRET as string;
require('dotenv').config();


export const createAccessToken = (usuario: any) => {
    const payload = {
        id: usuario.id,
        nombre:usuario.nombre,
        apellidoPaterno:usuario.lastName,
        apellidoMaterno:usuario.apellidoMaterno,
        email:usuario.email,
        picture:usuario.picture,
        expiresIn: process.env.SESSION_MAX_TIME,
    }
    return jwt.sign(payload, JWT_SECRET);
}

export const createRefreshToken = (usuario: any) => {
    const payload = {
        id: usuario.id,
        expiresIn: moment().add(30, 'days').unix(),
    }
    return jwt.sign(payload, JWT_SECRET);
}

export const decodeToken = (token: any) => {
    return jwt.verify(token, JWT_SECRET);
}

