
import { Request, Response } from "express";
import { Sequelize } from "sequelize";
import { Hitos, UsuarioHitosOrden, Usuarios } from "../models";
import { HitosProps, UsuarioInterface } from "../interfaces";

export const getHitos = async (req: Request, res: Response) => {

    const { proyectoId } = req.params;
    const { id } = req.user as UsuarioInterface;
    const where: any = {};

    if (proyectoId) {
        where.proyectoId = proyectoId;
    }


    try {
    
        const hitos = await Hitos.findAll({
            where,  
            logging: console.log,
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

    const { proyectoId } = req.body as HitosProps;

    try {
        const hito = await Hitos.create({proyectoId});
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
        const { titulo, descripcion, fechaInicio, fechaFin, status, proyectoId } = req.body as HitosProps;
       

        const where: any = { id };
        try {                      
            const hito = await Hitos.update({
                titulo,
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
