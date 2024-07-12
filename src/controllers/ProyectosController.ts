import { Request, Response } from "express";
import { Op } from "sequelize";
import { Hitos, Proyectos, Task, Usuarios} from "../models";
import { UsuarioInterface } from "../interfaces";
import formidable from "formidable";
import { uploadFile, deleteFile } from "../helpers/fileManagment";
import { io } from "../services/socketService";

const userSingleAttr = ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'iniciales', 'foto'];

export const getProyectos = async (req: Request, res: Response) => {
    
    const {} = req.body;
    const { id } = req.user as UsuarioInterface
    const where: any = {};


    where[Op.or] = [
        { propietarioId: id },
        { '$usuariosProyecto.id$': id }
    ];


    try {

        const proyectos = await Proyectos.findAll({
            where,
            include: [{
                model: Usuarios,
                as: 'usuariosProyecto',
                through: {
                    attributes: []
                },
                attributes: userSingleAttr,
            },{
                model: Usuarios,
                as: 'propietario',
                attributes: userSingleAttr,
            }],
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
                include: [
                    {
                        model: Usuarios,
                        as: 'usuariosProyecto',
                        attributes: userSingleAttr,
                    },
                    {
                        model: Usuarios,
                        as: 'propietario',
                        attributes: userSingleAttr,
                    }
                ],
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
        
    const form = formidable({ multiples: true });

    form.parse(req, async (err:Error, fields, files) => {
       

        if (err) {
            console.error(err);
            res.status(500).send(err);
        }
        const { titulo, descripcion, icono, fechaInicio, fechaFin, status } = fields
        const { id } = req.user as UsuarioInterface

        const participantes = fields.participantes.toString().split(',');      
            
        const [galeria] = Object.values(files) as any

        try {
            const proyecto = await Proyectos.create({
                titulo,
                descripcion,
                icono,
                fechaInicio,
                fechaFin,
                status,
                propietarioId: id
            });

            if (galeria) {
                const [imagen] = await uploadFile({files:galeria, folder: 'proyectos'})                
                proyecto.imagen = imagen.url;   
                await proyecto.save();
            }

            await proyecto.addUsuariosProyecto(participantes);
            await proyecto.reload({
                include: [{
                    model: Usuarios,
                    as: 'usuariosProyecto',
                    attributes: userSingleAttr,
                }],
            });

            // Crear un hito por defecto

            if(proyecto){
                const hito = await Hitos.create({
                    titulo: 'Nueva Sección',
                    descripcion: 'Descripción de la sección',
                    fechaInicio: proyecto.fechaInicio,
                    fechaFin: proyecto.fechaFin,
                    proyectoId: proyecto.id
                });

                if(!hito){
                    res.status(400).json({
                        msg: 'No se pudo crear el hito'
                    });
                }

                const actividades = ['Actividad 1', 'Actividad 2']

                if(hito){
                    for(const actividad of actividades){
                        await Task.create({
                            nombre: actividad,
                            taskeableId: hito.id,
                            taskeableType: 'HITO',
                            prioridad: 'MEDIA',
                            status: 'SIN_INICIAR',
                            progreso: 0,
                            propietarioId: id,
                            fechaFin: proyecto.fechaFin
                        });
                    }
                }


                io.to(participantes).emit('hito:created', hito);
            }


            io.to(participantes).emit('proyecto:created', proyecto);
            res.json({ proyecto });

        } catch (error) {
            console.log(error);
            res.status(500).json({
                msg: 'Hable con el administrador'
            });
        }       



    });
}

export const updateProyecto = async (req: Request, res: Response) => {
            
    const form = formidable({ multiples: true });

    form.parse(req, async (err:Error, fields, files) => {
       

        if (err) {
            console.error(err);
            res.status(500).send(err);
        }

        const { titulo, descripcion, icono, fechaInicio, fechaFin, status } = fields
        
        const { id } = req.params;
        const participantes = fields.participantes.toString().split(',');
            
        const [galeria] = Object.values(files) as any

        
        try {
            
            const proyecto = await Proyectos.findByPk(id)

            if (proyecto) {
                proyecto.titulo = titulo;
                proyecto.descripcion = descripcion;
                proyecto.icono = icono;
                proyecto.fechaInicio = fechaInicio;
                proyecto.fechaFin = fechaFin;
                proyecto.status = status;

                    if (files && galeria) {
                    
                        const [imagen] = await uploadFile({files:galeria, folder: 'proyectos'})
                        // Eliminar imagen anterior
                        if (proyecto.imagen && proyecto.imagen !== imagen.url) {
                            const oldImage = proyecto.imagen;
                            await deleteFile([oldImage])
                        }

                        proyecto.imagen = imagen.url;
                    }

                await proyecto.save();               
                await proyecto.setUsuariosProyecto(participantes);
                await proyecto.reload({
                    include: [{
                        model: Usuarios,
                        as: 'usuariosProyecto',
                        attributes: userSingleAttr,
                    }],
                });

                io.to(participantes).emit('proyecto:updated', proyecto);

                res.json({ proyecto });
            }else{
                res.status(400).json({
                    msg: 'No existe el proyecto'
                });
            }


        } catch (error) {
            console.log(error);
            res.status(500).json({
                msg: 'Hable con el administrador'
            });
        }
});
            


}

export const deleteProyecto = async (req: Request, res: Response) => {
                
    const { id } = req.params;

    try {
        const proyecto = await Proyectos.findByPk(id);

        if (proyecto) {
            await proyecto.destroy();
          
            // io.to(proyecto.usuariosProyecto.map((user: any) => user.id)).emit('proyecto:deleted', proyecto);

            res.json({ proyecto });
        }else{
            res.status(400).json({
                msg: 'No existe el proyecto'
            });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}   


