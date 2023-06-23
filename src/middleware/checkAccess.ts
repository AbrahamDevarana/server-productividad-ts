import { NextFunction, Request, Response } from 'express'
import { Usuarios, Roles, Permisos } from '../models'
import { UsuarioInterface } from '../interfaces';

export const checkAccess = (permiso: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.user as UsuarioInterface;

        const usuario = await Usuarios.findByPk(id, {
            include: [
                {
                    model: Roles,
                    as: 'rol',
                    include: [
                        {
                            model: Permisos,
                            as: 'permisos'
                        }
                    ]
                }
            ]
        });

        if (!usuario) {
            return res.status(401).json({
                msg: 'No autorizado'
            });
        }

        const { rol } = usuario


        if (!rol) {
            return res.status(401).json({
                msg: 'No autorizado'
            });
        }

        const { permisos } = rol;
                

        if (!permisos) {
            return res.status(401).json({
                msg: 'No autorizado'
            });
        }

        const permisosArray = permisos.map(( permiso: any ) => permiso.permisos);

        if (!permisosArray.includes(permiso)) {
            return res.status(401).json({
                msg: 'No autorizado'
            });
        }

        next();

    }
}


    
    