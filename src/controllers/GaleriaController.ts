import { Request, Response } from "express";
import { GaleriaDevarana, GaleriaUsuarios } from "../models";
import formidable, { Fields, Files } from "formidable";
import { uploadFile } from "../helpers/fileManagment";


export const getGaleriaDevarana = async (req: Request, res: Response) => {

    try {
        const galeria_devarana = await GaleriaDevarana.findAll();        
        res.json({ galeria_devarana });
    } catch (error) {
        res.status(500).json({
            error
        });
    }
}

export const getGaleriaUsuario = async (req: Request, res: Response) => {

    try {
        const { type } = req.query;
        const galeria_usuarios = await GaleriaUsuarios.findAll({ where: { type } });        
        res.json({ galeria_usuarios });
    } catch (error) {
        res.status(500).json({
            error
        });
    }
}


export const uploadGaleriaUsuario = async (req: Request, res: Response) => {

    const form = formidable({ multiples: true });

    form.parse(req, async (err: Error, fields: Fields, files: Files) => {

        if (err) {
            console.error(err);
            res.status(500).send(err);
        }        

        const galeria = Object.values(files)

        try {

            const result = await uploadFile({
                files: galeria,
                folder: 'portadas/usuarios'
            });

            console.log(result);
            

            if (result.length > 0) {
                await GaleriaUsuarios.create({
                    imagen: result[0].url,
                    type: 'BANNER_PERFIL',
                    usuarioId: fields.usuarioId
                })
            }

          
            

            return res.status(200).json({
                ok: true,
                msg: 'uploadGaleriaUsuario'
            })

        } catch (error) {
            console.log(error);
            res.status(500).json({
                msg: 'Hable con el administrador'
            });
        }
    })
    

}



