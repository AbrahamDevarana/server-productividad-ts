import { Request, Response } from "express";
import { Permisos, Roles } from "../models";
import { RolesAttributes } from "../models/Roles";


export const getRoles = async (req: Request, res: Response) => {

    try {
        const roles = await Roles.findAll({
            where: {
                status: 1
            },
            include: [
                {
                    model: Permisos,
                    as: 'permisos',
                }
            ]
        });

        res.json({ roles });
    }
    catch (error) {
        console.log(error);

        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const getRol = async (req: Request, res: Response) => {
    
    const { id } = req.params;

    try {
        const rol = await Roles.findByPk(id);

        res.json({ rol });
    }
    catch (error) {
        console.log(error);

        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}


export const createRol = async (req: Request, res: Response) => {
    
    const { nombre, descripcion } = req.body as RolesAttributes

    try {
        const rol = await Roles.create({
            nombre,
            descripcion
        });

        res.json({ rol });

    }
    catch (error) {
        console.log(error);

        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }   
}

export const updateRol = async (req: Request, res: Response) => {
        
    const { id } = req.params;

    const { nombre, descripcion } = req.body as RolesAttributes;

    try {
        const rol = await Roles.findByPk(id);

       if (rol) {
           await rol.update({
               nombre,
               descripcion
           });

            res.json({ rol });
       }else {
            res.status(404).json({
                msg: 'No existe el rol'
            });
       }
    }
    catch (error) {
        console.log(error);

        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }   
}


export const deleteRol = async (req: Request, res: Response) => {
            
        const { id } = req.params;
    
        try {
            const rol = await Roles.findByPk(id);
    
              if (rol) {
                rol.destroy();

                res.json({ rol });
              }else {
                res.status(404).json({
                    msg: 'No existe el rol'
                });
              }
        }
        catch (error) {
            console.log(error);
    
            res.status(500).json({
                msg: 'Hable con el administrador'
            });
        }   
    }

