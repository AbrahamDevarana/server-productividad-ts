import { createAccessToken, createRefreshToken, decodeToken, willExpireToken } from '../services/jwtService';
import jwt from 'jsonwebtoken';
import { Usuarios } from '../models';
import { Request, Response } from "express";

const getAccessToken = async (req: Request, res: Response) => {
    if (req.user) {
        const accessToken = createAccessToken(req.user);
        const refreshToken = createRefreshToken(req.user);

        res.status(200).json({ accessToken, refreshToken });
    }else{
        res.status(401).json({ message: 'No has iniciado sesión' })
    }
}

const refreshAccessToken = async (req: Request, res: Response) => {
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

const sessionValidate = async (req: Request, res: Response) => {

    const token = req.header('Authorization')   

    if (!token) {
        res.status(401).json({ message: 'No has iniciado sesión', ok: false })
    }else{
        if (willExpireToken(token)) {
            res.status(401).json({ message: 'Sesión ha expirado', ok: false })
        }else{            
            jwt.verify(token, process.env.JWT_SECRET as string, async (error: any, decoded: any) => {
                if (error) {
                  res.status(401).json({ msg: 'Token no valido' });
                } else {
                    if (decoded) {
                        const usuario = await Usuarios.findOne({ 
                            where: { id: decoded.id },
                            attributes: ['id','nombre', 'apellidoPaterno', 'apellidoMaterno', 'email', 'foto', 'iniciales']
                        });
                        if (!usuario) {
                            res.status(401).json({ message: 'No has iniciado sesión', ok: false })
                        }else{
                            res.status(200).json({ message: 'Has iniciado sesión correctamente', ok: true, accessToken: token, usuario})
                        }
                    }else{
                        res.status(401).json({ message: 'No has iniciado sesión', ok: false })
                    }
                }
            })
        }
    }

       

    
}


export { getAccessToken, refreshAccessToken, sessionValidate }