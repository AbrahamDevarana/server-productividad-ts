
import { Request, Response } from "express";
import { UsuarioInterface } from "../interfaces";
import { Social } from "../models";


export const updateSocial = async (req: Request, res: Response) => {
    const {  nombre, url } = req.body;
    const { id: usuarioId } = req.user as UsuarioInterface;

    console.log(req.body);
    
    try {
        const social = await Social.findOrCreate({ where: { usuarioId, nombre }, defaults: { url, usuarioId, nombre } });
        if (social[1]) {
            return res.status(201).json({ message: 'Se ha creado la red social' })
        }
        await Social.update({ url }, { where: { nombre, usuarioId } });
        return res.status(200).json({ message: 'Se ha actualizado la red social' })
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Ha ocurrido un error' })
    }
}


