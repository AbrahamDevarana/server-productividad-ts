import jwt from 'jsonwebtoken';
import { Usuarios } from '../models';
import { Request, Response, NextFunction } from 'express';


export default async (req: Request, res: Response, next: NextFunction) => {    
    const token = req.header('accessToken')
    if (!token) {
        return res.status(401).json({ message: 'No has iniciado sesión' })
    }
    try {
        jwt.verify(token, process.env.JWT_SECRET as string, async (error: any, decoded: any) => {
            if (error) {
              return res.status(401).json({ msg: 'Token no valido' });
            } else {
                if (decoded) {
                    
                    
                    const usuario = await Usuarios.findOne({ where: { id: decoded.id } });
                    if (!usuario) {
                        return res.status(401).json({ message: 'No has iniciado sesión' })
                    }else{
                        req.body.id = decoded.id;
                        req.user = usuario.dataValues;
                        next();
                    }
                }else{
                    return res.status(401).json({ message: 'No has iniciado sesión' })
                }
            }
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Ha ocurrido un error' })
    }
}