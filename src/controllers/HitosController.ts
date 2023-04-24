
import { Request, Response } from "express";
import { Sequelize } from "sequelize";
import { Hitos } from "../models";

export const getHitos = async (req: Request, res: Response) => {

    const { proyectoId } = req.query;
    const where: any = {};


    // proyectoId

    if (proyectoId) {
        where.proyectoId = proyectoId;
    }


    try {

        const hitos = await Hitos.findAll({
            where,
        });       

        res.json({ hitos });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const createHito = async (req: Request, res: Response) => {

    const { nombre, descripcion, fechaInicio, fechaFin, status, proyectoId } = req.body;
    const where: any = {};
    try {

        const hito = await Hitos.create({
            nombre,
            descripcion,
            fechaInicio,
            fechaFin,
            status,
            proyectoId
        });

        res.json({ hito });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }

}

export const updateHito = async (req: Request, res: Response) => {
    
        const { id } = req.params;
        const { nombre, descripcion, fechaInicio, fechaFin, status, proyectoId } = req.body;
        const where: any = { id };
        try {
    
            const hito = await Hitos.update({
                nombre,
                descripcion,
                fechaInicio,
                fechaFin,
                status,
                proyectoId
            }, {
                where
            });
    
            res.json({ hito });
    
        } catch (error) {
            console.log(error);
            res.status(500).json({
                msg: 'Hable con el administrador'
            });
        }
    
}


export const deleteHito = async (req: Request, res: Response) => {
        
        const { id } = req.params;
        const where: any = { id };
        try {
    
            const hito = await Hitos.destroy({
                where
            });
    
            res.json({ hito });
    
        } catch (error) {
            console.log(error);
            res.status(500).json({
                msg: 'Hable con el administrador'
            });
        }
        
}
