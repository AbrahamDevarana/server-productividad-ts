import { Request, Response } from "express";
import { Permisos, Roles } from "../models";
import { RoleModel } from "../models/Roles";


export const getRoles = async (req: Request, res: Response) => {

    try {
        const roles = await Roles.findAll({
            where: {
                status: 1
            }
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
        const role = await Roles.findOne({
            where: {
                id,
                status: 1
            }, 
            include: [{
                model: Permisos,
                as: 'permisos',
                attributes: ['id', 'nombre', 'permisos'],
                through: {
                    attributes: []
                }
            }]
        });
    
        res.json({ role });
    }
    catch (error) {
        console.log(error);

        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const createRol = async (req: Request, res: Response) => {
    
    const { nombre, descripcion, permisos } = req.body as RoleModel

    try {
        const rol = await Roles.create({
            nombre,
            descripcion
        });

        if (permisos) {
            await rol.setPermisos(permisos);
        }

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

    const { nombre, descripcion, permisos } = req.body as RoleModel;

    try {
        const rol = await Roles.findByPk(id);

        
        if (rol) {
            await rol.update({
                nombre,
                descripcion
            });

            if (permisos) {
                await rol.setPermisos(permisos);
            }

            await rol.reload({
                include: [{
                    model: Permisos,
                    as: 'permisos',
                    attributes: ['id', 'nombre', 'permisos'],
                    through: {
                        attributes: []
                    }
                }]
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

