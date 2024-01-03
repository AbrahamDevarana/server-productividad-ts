import { Request, Response } from "express";
import { GaleriaDevarana, GaleriaUsuarios, Usuarios } from "../models";
import formidable, { Fields, Files } from "formidable";
import { deleteFile, uploadFile } from "../helpers/fileManagment";
import { UsuarioInterface } from "../interfaces";


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
        const { type } = req.query as any;
        const galeria_usuarios = await GaleriaUsuarios.findAll({
            where: { type }});
        res.json({ galeria_usuarios });
    } catch (error) {
        res.status(500).json({
            error
        });
    }
}


export const uploadGaleriaUsuario = async (req: Request, res: Response) => {
    const form = formidable({ multiples: true });
    const { id } = req.user as UsuarioInterface;

    form.parse(req, async (err: Error, fields: Fields, files: Files) => {
        if (err) {
            console.error(err);
            return res.status(500).send(err);
        }

        const galeria = Object.values(files);

        try {
            const usuario = await Usuarios.findByPk(id);
            if (!usuario) {
                return res.status(404).json({ ok: false, msg: 'No existe el usuario' });
            }

            const result = await uploadFile({
                files: galeria,
                folder: 'portadas/usuarios'
            });

            if (result.length === 0) {
                return res.status(404).json({ ok: false, msg: 'No se pudo subir la imagen' });
            }

            // Suponiendo que quieres crear un registro para cada archivo subido
            for (const file of result) {
                const banner = await GaleriaUsuarios.create({
                    url: file.url,
                    type: 'BANNER_PERFIL',
                    usuarioId: usuario.id
                });

                if (!banner) {
                    console.error('No se pudo crear el banner para el archivo:', file.name);
                     return res.status(500).json({ ok: false, msg: 'No se pudo crear el banner' });
                }
            }
            

            return res.status(200).json({
                ok: true,
                msg: 'uploadGaleriaUsuario',
                galeria_usuarios: result
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({
                msg: 'Hable con el administrador'
            });
        }
    });
};


export const deleteGaleriaUsuario = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { id: usuarioId } = req.user as UsuarioInterface;

    try {
        const imagen = await GaleriaUsuarios.findByPk(id);
        if (!imagen) {
            return res.status(404).json({ ok: false, msg: 'No existe la imagen' });
        }

        if (imagen.usuarioId !== usuarioId) {
            return res.status(401).json({ ok: false, msg: 'No tiene permisos para eliminar esta imagen' });
        }        

        await deleteFile([imagen.url]);

        await imagen.destroy();


        return res.status(200).json({
            ok: true,
            msg: 'deleteGaleriaUsuario',
            imagen
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}



