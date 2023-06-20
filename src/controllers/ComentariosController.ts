import { Request, Response } from "express";
import { Comentarios, Usuarios } from "../models";
import { UsuarioInterface } from "../interfaces";
import { ComentarioProps } from "../interfaces/Comentario";

export const getComentarios = async (req: Request, res: Response) => {

    const { comentableType, comentableId } = req.query 

    try {
        const comentarios = await Comentarios.findAll({
            where: {
                comentableType,
                comentableId
            },
            include: [
                {
                    as: 'autor',
                    model: Usuarios,
                    attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'iniciales', 'foto'],
                }
            ]

        });

        res.json({ comentarios });
    }
    catch (error) {
        console.log(error);

        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}


export const createComentario = async (req: Request, res: Response) => {
    
        const { mensaje, comentableType, comentableId } = req.body as ComentarioProps;
        const { id } = req.user as UsuarioInterface;
    
        try {
            const comentario = await Comentarios.create({
                mensaje,
                comentableType,
                comentableId,
                autorId: id
            });
    
            await comentario.reload({
                include: [
                    {
                        as: 'autor',
                        model: Usuarios,
                        attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'iniciales', 'foto'],
                    }
                ]
            });
    
            res.json({ comentario });
        }
        catch (error) {
            console.log(error);
    
            res.status(500).json({
                msg: 'Hable con el administrador'
            });
        }
    }