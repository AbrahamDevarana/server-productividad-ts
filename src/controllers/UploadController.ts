import formidable, { Files, Fields } from 'formidable';
import { deleteFile, uploadFiles } from "../helpers/fileManagment";

import { Proyectos } from '../models'


export const uploadProyectoBanner = async (req: any, res: any) => {

    const { id } = req.params;

    const proyecto = await Proyectos.findByPk(id);

    if (!proyecto) {
        return res.status(404).json({ ok: false, msg: 'No existe el proyecto' })
    }

    const form = formidable({ multiples: true });

    form.parse(req, async (err: Error, fields: Fields, files: Files) => {

        if (err) {
            console.error(err);
            res.status(500).send(err);
        }

        const galeria = Object.values(files)

        try {
                
            const result = await uploadFiles(galeria, 'proyectos' );

            if(result){
                await proyecto.update({
                    imagen: result[0].url
                })
            }

            return res.status(200).json({
                    ok: true,
                    msg: 'uploadProyectoBanner'
            })

        } catch (error) {
            console.log(error);
            res.status(500).json({
                msg: 'Hable con el administrador'
            });
        }
    })
            


    
}

export const uploadUsuarioAvatar = async (req: any, res: any) => {

    return res.status(200).json({
        ok: true,
        msg: 'uploadUsuarioAvatar'
    })
}