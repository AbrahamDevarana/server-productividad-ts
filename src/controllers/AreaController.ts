import { Request, Response } from "express";
import { Op } from "sequelize";
import { Areas } from "../models/Areas";
import { getPagination, getPagingData } from "../helpers/pagination";

export const getAreas = async (req: Request, res: Response) => {
        
        const { page = 0, size = 10, nombre } = req.query;


        const { limit, offset } = getPagination(Number(page), Number(size));

        const where: any = {};

        nombre && (where.nombre = { [Op.like]: `%${nombre}%` });

        console.log(where);
        

        try {
            const result = await Areas.findAndCountAll({ 
                where,
                include: ['subAreas'],
                limit,
                offset
            });

            const areas = getPagingData (result, Number(page), Number(size));
      
            
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

export const createArea = async (req: Request, res: Response) => {

    const { nombre, parentId } = req.body;

    try {
        const area = await Areas.create({ nombre, parentId: parentId || null });
        res.json({ area });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const updateArea = async (req: Request, res: Response) => {
    
    const { id } = req.params;
    const { nombre, parentId } = req.body;
    console.log(parentId);
    

    try {
        const area = await Areas.findByPk(id);
        if (area) {
            await area.update({ nombre, parentId: parentId || null })
            
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


export const deleteArea = async (req: Request, res: Response) => {
        
    const { id } = req.params;

    try {
        const area = await Areas.findByPk(id);
        if (area) {
            await area.destroy();
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


