import { Request, Response } from "express";
import { Sequelize } from "sequelize";
import { Proyectos, Hitos, Usuarios, AccionesP } from "../models";


export const getProyectos = async (req: Request, res: Response) => {
    
    const {} = req.body;
    const where: any = {};
    try {

        const proyectos = await Proyectos.findAll({
            where,
        });       

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
                include: [{
                    model: Hitos,
                    as: 'proyectos_hitos',
                    attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
                    include: [{
                        as: 'hitos_acciones',
                        model: AccionesP,
                        attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
                        include: [{
                            as: 'propietario',
                            model: Usuarios,
                            attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
                        }]
                    }]
                }],
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

export const updateProyecto = async (req: Request, res: Response) => {
            
        const { id } = req.params;
        const { titulo, descripcion, icono, imagen, fechaInicio, fechaFin, status } = req.body;
        const where: any = { id };
        try {
    
            const proyecto = await Proyectos.findOne({
                where,
            });       
    
            if (!proyecto) {
                return res.status(404).json({
                    msg: `No existe un proyecto con el id ${id}`
                });
            }
    
            await proyecto.update({
                titulo,
                descripcion,
                icono,
                imagen,
                fechaInicio,
                fechaFin,
                status,
            });

            console.log(proyecto);
            
    
            res.json({ proyecto });
    
        } catch (error) {
            console.log(error);
            res.status(500).json({
                msg: 'Hable con el administrador'
            });
        }
    }


