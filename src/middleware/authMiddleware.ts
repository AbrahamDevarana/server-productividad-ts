import jwt from 'jsonwebtoken';
import { Usuarios } from '../models';
import { Request, Response, NextFunction } from 'express';
import { UsuarioInterface } from '../interfaces';


export default async (req: Request, res: Response, next: NextFunction) => {    
    const token = req.header('accessToken')
    if (!token) {
        return res.status(401).json({ message: 'No has iniciado sesión 2' })
    }
    try {
        jwt.verify(token, process.env.JWT_SECRET as string, async (error: any, decoded: any) => {
            if (error) {
              return res.status(401).json({ msg: 'Token no valido' });
            } else {                
                if (decoded) {

                    if(decoded.id === 'system'){
                        return next();
                    }

                    const usuario = await Usuarios.findOne({ where: { id: decoded.id } });
                    if (!usuario) {
                        return res.status(401).json({ message: 'No has iniciado sesión 1' })
                    }else{
                        req.body.id = decoded.id;
                        req.user = usuario.dataValues as UsuarioInterface;
                        next();
                    }
                }else{
                    return res.status(401).json({ message: 'No has iniciado sesión 3' })
                }
            }
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Ha ocurrido un error' })
    }
}