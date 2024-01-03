import { Request, Response } from "express";
import { Permisos } from "../models";
import { PermisosModel } from "../models/Permisos";


export const getPermisos = async (req: Request, res: Response) => {
    
    try {
        const permisos = await Permisos.findAll();
        res.json({ permisos });
    }
    catch (error) {
        console.log(error);

        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const getPermiso = async (req: Request, res: Response) => {
        
    const { id } = req.params;

    try {
        const permiso = await Permisos.findByPk(id);

        res.json({ permiso });
    }
    catch (error) {
        console.log(error);

        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}


export const createPermiso = async (req: Request, res: Response) => {
            
    const { nombre, permisos } = req.body as PermisosModel

    try {
        const permiso = await Permisos.create({
            nombre,
            permisos
        });

        res.json({ permiso });
    }
    catch (error) {
        console.log(error);

        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }

}

export const updatePermiso = async (req: Request, res: Response) => {
            
    const { id } = req.params;

    const { nombre, permisos } = req.body as PermisosModel;

    try {
        const permiso = await Permisos.findByPk(id);

        await permiso?.update({
            nombre,
            permisos
        });

        res.json({ permiso });
    }
    catch (error) {
        console.log(error);

        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }

}

export const deletePermiso = async (req: Request, res: Response) => {
                
    const { id } = req.params;

    try {
        const permiso = await Permisos.findByPk(id);
        await permiso?.destroy();
        res.json({ permiso });
    }
    catch (error) {
        console.log(error);

        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }

}