// Path: src\models\Usuario.ts
import { Usuarios } from "../models";
import { Request, Response } from "express";
import { Op } from "sequelize";

export const getUsuarios = async (req: Request, res: Response) => {

    const { nombre, apellidoPaterno, apellidoMaterno, email } = req.query;
    
    const where: any = {
        nombre: {
            [Op.like]: `%${nombre}%`
        },
        apellidoPaterno: {
            [Op.like]: `%${apellidoPaterno}%`
        },
        apellidoMaterno: {
            [Op.like]: `%${apellidoMaterno}%`
        },
        email: {
            [Op.like]: `%${email}%`
        }
    };  

    try {
        const usuarios = await Usuarios.findAll({ where });
        res.json({ usuarios });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
};

