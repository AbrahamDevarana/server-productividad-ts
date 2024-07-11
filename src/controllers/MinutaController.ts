
import { Request, Response } from "express";
import { Minuta } from "../models";
import { io } from "../services/socketService";
import type { MinutasProps } from "../interfaces";

export const getMinutas = async (req: Request, res: Response) => {
    const { proyectoId } = req.query;

    const where: any = {};

    if (proyectoId) {
        where.minuteableId = proyectoId;
    }

    try {
        const minutas = await Minuta.findAll({
            where,
        });

        res.json({ minutas });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const getMinuta = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const minuta = await Minuta.findByPk(id);

        if (!minuta) {
            return res.status(404).json({
                msg: 'Minuta no encontrada'
            });
        }

        res.json({ minuta });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const createMinuta = async (req: Request, res: Response) => {
    const { minuteableId, minuteableType } = req.body as MinutasProps
    const {id} = req.user as {id: string};
    try {
        const minuta = await Minuta.create({ 
            minuteableId,
            authorId: id,
            minuteableType
         });

        // io.emit('minuta', minuta);

        res.json({ minuta });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}


export const updateMinuta = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { titulo, descripcion, fecha, minuteableId, minuteableType } = req.body as MinutasProps;
    
    try {
        const minuta = await Minuta.findByPk(id);

        if (!minuta) {
            return res.status(404).json({
                msg: 'Minuta no encontrada'
            });
        }

        await minuta.update({
            titulo: titulo ? titulo : minuta.titulo,
            descripcion: descripcion ? descripcion : minuta.descripcion,
            fecha: fecha ? fecha : minuta.fecha,
            minuteableId: minuteableId ? minuteableId : minuta.minuteableId,
            minuteableType: minuteableType ? minuteableType : minuta.minuteableType,
        });

        res.json({ minuta });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const deleteMinuta = async (req: Request, res: Response) => {
    const { id } = req.params;
    const where: any = { id };

    try {
        const minuta = await Minuta.destroy({
            where
        });

        res.json({ minuta });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}
