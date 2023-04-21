import { Request, Response } from "express";
import { Sequelize } from "sequelize";
import { Proyectos } from "../models";


export const getProyectos = async (req: Request, res: Response) => {
    
    const {} = req.body;
    const where: any = {};
    try {

        const proyectos = await Proyectos.findAll({
            where,
        });       

        console.log(proyectos);
        

        res.json({ proyectos });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const getProyecto = async (req: Request, res: Response) => {
        
        const { id } = req.params;
        const where: any = { id };
        try {
    
            const proyecto = await Proyectos.findOne({
                where,
            });       
    
            res.json({ proyecto });
    
        } catch (error) {
            console.log(error);
            res.status(500).json({
                msg: 'Hable con el administrador'
            });
        }
}


export const createProyecto = async (req: Request, res: Response) => {
        
    const { titulo, descripcion, icono, imagen, fechaInicio, fechaFin, status } = req.body;
    const where: any = {};
    try {

        const proyecto = await Proyectos.create({
            titulo,
            descripcion,
            icono,
            imagen,
            fechaInicio,
            fechaFin,
            status,
        });       

        res.json({ proyecto });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}


