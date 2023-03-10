// Path: src\models\Usuario.ts
import { Usuarios } from "../models";
import { Request, Response } from "express";
import { Op } from "sequelize";
import { getPagination, getPagingData } from "../helpers/pagination";

export const getUsuarios = async (req: Request, res: Response) => {
   

    const { nombre, apellidoPaterno, apellidoMaterno, email, page = 0, size = 10 } = req.query;
    
    const { limit, offset } = getPagination(Number(page), Number(size));

    const where: any = {};  

    nombre && (where.nombre = { [Op.like]: `%${nombre}%` });
    apellidoPaterno && (where.apellidoPaterno = { [Op.like]: `%${apellidoPaterno}%` });
    apellidoMaterno && (where.apellidoMaterno = { [Op.like]: `%${apellidoMaterno}%` });
    email && (where.email = { [Op.like]: `%${email}%` });

    try {
        const result = await Usuarios.findAndCountAll({ 
            where,
            include: ['area'],
            
        })

        const usuarios = getPagingData(result, Number(page), Number(size));
        res.json({ usuarios });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
};

export const getUsuario = async (req: Request, res: Response) => {
    
        const { id } = req.params;
    
        try {
            const usuario = await Usuarios.findByPk(id,
                { 
                    include: ['area']
                }
            );
            if (usuario) {
                res.json({ usuario });
            } else {
                res.status(404).json({
                    msg: `No existe un usuario con el id ${id}`
                });
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({
                msg: 'Hable con el administrador'
            });
        }
    }

