import { createAccessToken, createRefreshToken } from '../services/jwtService';
import moment from 'moment';
import { Usuarios } from '../models';


const getAccessToken = async (req: any, res: any) => {
    
    if (req.user) {
        const accessToken = createAccessToken(req.user);
        const refreshToken = createRefreshToken(req.user);

        res.status(200).json({ accessToken, refreshToken });
    }else{
        res.status(401).json({ message: 'No has iniciado sesión' })
    }
}

const willExpireToken = (token: any) => {
    const { exp } = token;
    const currentDate = moment().unix();

    if (currentDate > exp) {
        return true;
    }
    return false;
}

const refreshAccessToken = async (req: any, res: any) => {
    const { refreshToken } = req.body;
    const isTokenExpired = willExpireToken(refreshToken);

    if (isTokenExpired) {
        res.status(404).json({ message: 'El token ha expirado' })
    }else{
        try {
                const { id } = refreshToken;
            const usuario = await Usuarios.findOne({ where: { id } });
            if (!usuario) {
                res.status(404).json({ message: 'Usuario no encontrado' })
            }else{
                const accessToken = createAccessToken(usuario);
                const refreshToken = createRefreshToken(usuario);
                res.status(200).json({ accessToken, refreshToken });
            }
        } catch (error) {
            res.status(500).json({ message: 'Ha ocurrido un error' })
            console.log(error);
            
        }
    }
}


export { getAccessToken, refreshAccessToken }