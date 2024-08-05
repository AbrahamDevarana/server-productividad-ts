
import { Request, Response } from "express";
import { Op } from "sequelize";
import { Task, Usuarios, Comites, Listado} from "../models";
import { ComitesProps, UsuarioInterface } from "../interfaces";
import formidable from "formidable";
import { io } from "../services/socketService";
import { uploadFile } from "../helpers/fileManagment";

const userSingleAttr = ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'iniciales', 'foto'];


export const getComites = async (req: Request, res: Response) => {

    const { id } = req.user as UsuarioInterface
    const where:any = {};

    where[Op.or] = [
        { propietarioId: id },
        { '$usuariosComite.id$': id }
    ];

    try {
        const comites = await Comites.findAll({
            include: [
                {
                    model: Usuarios,
                    as: 'usuariosComite',
                    through: {
                        attributes: []
                    },
                    attributes: userSingleAttr
                },
                {
                    model: Usuarios,
                    as: 'propietario',
                    attributes: userSingleAttr
                }
            ],
            where
        });

        res.status(200).json({comites});

    } catch (error) {
        res.status(500).json({ message: error });
    }
}

export const getComite = async (req: Request, res: Response) => {
    try {
        const comite = await Comites.findByPk(req.params.id, {
            include: [
                {
                    model: Usuarios,
                    as: 'usuariosComite',
                    through: {
                        attributes: []
                    },
                    attributes: userSingleAttr
                },
                {
                    model: Usuarios,
                    as: 'propietario',
                    attributes: userSingleAttr
                }
            ]
        });

        res.status(200).json({comite});
    } catch (error) {
        res.status(500).json({ message: error });
    }
}

export const createComite = async (req: Request, res: Response) => {
  const form = formidable({ multiples: true });
  form.parse(req, async (err, fields, files) => {
    if(err) {
        res.status(400).json({ message: err });
        }

        const {titulo, descripcion, icono, fechaInicio, fechaFin, status} = fields
        const {id} = req.user as UsuarioInterface

        const participantes = fields.participantes.toString().split(',')
        const [galeria] = Object.values(files) as any

        try {
            const comite = await Comites.create({
                titulo,
                descripcion,
                icono,
                fechaInicio,
                fechaFin,
                status,
                propietarioId: id,
            });

            if(galeria){
                const [imagen] = await uploadFile({files: galeria, folder: 'comites'});
                comite.imagen = imagen.url
                await comite.save();
            }

            await comite.addUsuariosComite(participantes);

            await comite.reload({
                include: [
                    {
                        model: Usuarios,
                        as: 'usuariosComite',
                        through: {
                            attributes: []
                        },
                        attributes: userSingleAttr
                    },
                ]
            });

            if(comite){
                const listado = await Listado.create({
                    comiteId: comite.id,
                    titulo: 'Tareas',
                    descripcion: 'Listado de tareas del comite',
                    fechaInicio: comite.fechaInicio,
                    fechaFin: comite.fechaFin,
                });
                
                if(!listado){
                    res.status(500).json({ message: 'Error al crear el listado' });
                }

                const tareas = ['Tarea 1', 'Tarea 2'];

                if(listado && listado.id){
                    for (const tarea of tareas) {
                        await Task.create({
                            nombre: tarea,
                            taskeableId: listado.id,
                            taskeableType: 'HITO',
                            prioridad: 'MEDIA',
                            status: 'SIN_INICIAR',
                            progreso: 0,
                            propietarioId: id,
                            fechaFin: comite.fechaFin
                        })
                    }
                }
                io.to(participantes).emit('comite:created', listado);
            }

            io.to(participantes).emit('listado:created', comite);

            res.status(201).json({comite});
        } catch (error) {
            res.status(500).json({ message: error });
        }
    });
}

export const updateComite = async (req: Request, res: Response) => {
    const form = formidable({ multiples: true });
    form.parse(req, async (err, fields, files) => {

        if (err) {
            res.status(500).json({ message: err });
        }

        const { titulo, descripcion, icono, fechaInicio, fechaFin, status } = fields;
        const { id } = req.user as UsuarioInterface;
        const participantes = fields.participantes.toString().split(',');
        const [galeria] = Object.values(files) as any;

        try{ 
            const comite = await Comites.findByPk(req.params.id);

            if (comite) {
                await comite.update({
                    titulo,
                    descripcion,
                    icono,
                    fechaInicio,
                    fechaFin,
                    status
                });

                if (galeria) {
                    const [imagen] = await uploadFile({ files: galeria, folder: 'comites' });
                    comite.imagen = imagen.url;
                    await comite.save();
                }

                await comite.setUsuariosComite(participantes);

                await comite.reload({
                    include: [
                        {
                            model: Usuarios,
                            as: 'usuariosComite',
                            through: {
                                attributes: []
                            },
                            attributes: userSingleAttr
                        },
                    ]
                });

                io.to(participantes).emit('comite:updated', comite);

                res.status(200).json({comite});
            } else {
                res.status(404).json({ message: 'Comite no encontrado' });
            }
        }
        catch (error) {
            res.status(500).json({ message: error });
        }
    })
}

export const deleteComite = async (req: Request, res: Response) => {
    try {
        const comite = await Comites.findByPk(req.params.id);
        if (comite) {
            await comite.destroy();
            res.status(200).json({comite});
        } else {
            res.status(404).json({ message: 'Comite no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: error });
    }
}