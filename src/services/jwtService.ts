import jwt from 'jsonwebtoken';
import moment from 'moment';
const JWT_SECRET = process.env.JWT_SECRET as string;
require('dotenv').config();


export const createAccessToken = (usuario: any) => {
    console.log(usuario);
    
    const payload = {
        id: usuario.id,
        nombre:usuario.nombre,
        apellidoPaterno:usuario.lastName,
        apellidoMaterno:usuario.apellidoMaterno,
        email:usuario.email,
        foto: usuario.foto,
        expiresIn: moment().add(7, 'days').unix(),
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


export const willExpireToken = (token: any) => {

    const { expiresIn }: any = decodeToken(token);
    
    const now = moment().unix();

    // Expira en...
    // console.log('Expira en: ', moment.unix(expiresIn).format('DD/MM/YYYY HH:mm:ss')); 

    if (now > expiresIn) {
        return true;
    }else{
        return false;
    }

    
}

