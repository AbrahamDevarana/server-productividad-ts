import { Request, Response } from "express";
import { Op } from "sequelize";
import { Areas } from "../models/Areas";

export const getAreas = async (req: Request, res: Response) => {
        const { nombre } = req.query;        
        const where: any = {};

        nombre && (where.nombre = { [Op.like]: `%${nombre}%` });

        try {
            const areas = await Areas.findAll({ 
                where,
                include: ['subAreas']
            });
            res.json({ areas });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                msg: 'Hable con el administrador'
            });
        }
    }

export const getArea = async (req: Request, res: Response) => {
            
    const { id } = req.params;

    try {
        const area = await Areas.findByPk(id,
            { 
                include: ['subAreas']
            }
        );
        if (area) {
            res.json({ area });
        } else {
            res.status(404).json({
                msg: `No existe la área seleccionada`
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}


