import { Request, Response } from "express";
import { Tareas, Hitos, Proyectos, Usuarios } from "../models";
import { Op } from "sequelize";
import { TareaInterface, UsuarioInterface } from "../interfaces";
import { io } from "../services/socketService";


export const getTarea = async (req: Request, res: Response) => {
    const { id } = req.params;

    let where = {}

    try {
        const tarea = await Tareas.findByPk(id,
            {
                include: [
                    {
                        as: 'propietario',
                        model: Usuarios,
                        attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'iniciales', 'email', 'foto', 'slug'],
                    },
                    {
                        as: 'usuariosTarea',
                        model: Usuarios,
                        attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'iniciales', 'email', 'foto', 'slug'],
                        through: {
                            attributes: []
                        }
                    }
                ]
            });
        // obtener proyecto al que corresponden las acciones 

        res.json({ tarea });
    }
    catch (error) {
        console.log(error);

        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const createTarea = async (req: Request, res: Response) => {

    const { nombre, hitoId } = req.body as TareaInterface;
    const { id } = req.user as UsuarioInterface;

    try {
        const tarea = await Tareas.create({
            nombre,
            hitoId,
            propietarioId: id
        });

        await tarea.reload({
            include: [
                {
                    as: 'propietario',
                    model: Usuarios,
                    attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'iniciales', 'email', 'foto', 'slug'],
                },
                {
                    as: 'usuariosTarea',
                    model: Usuarios,
                    attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'iniciales', 'email', 'foto', 'slug'],
                    through: {
                        attributes: []
                    }
                }
            ]
        })

        res.json({ tarea });

    }
    catch (error) {
        console.log(error);

        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }

}

export const updateTarea = async (req: Request, res: Response) => {

    const { id } = req.params;

    const { nombre, descripcion, propietarioId, participantes, fechaFin, fechaInicio, hitoId, propietario , status } = req.body as TareaInterface;

    try {
        const tarea = await Tareas.findByPk(id);

        if (!tarea) {
            return res.status(404).json({
                msg: 'No existe una accion con el id ' + id
            });
        }

        await tarea.update({
            nombre,
            descripcion,
            propietarioId,
            fechaFin,
            fechaInicio,
            hitoId,
            propietario,
            status
        });

        await tarea.setUsuariosTarea(participantes);

        await tarea.reload({
            include: [
                {
                    as: 'propietario',
                    model: Usuarios,
                    attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'iniciales', 'email', 'foto', 'slug'],
                },
                {
                    as: 'usuariosTarea',
                    model: Usuarios,
                    attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'iniciales', 'email', 'foto', 'slug'],
                    through: {
                        attributes: []
                    }
                }
            ]
        });

        io.to(participantes).emit('tareas:updated', tarea);

        res.json({ tarea });

    }
    catch (error) {
        console.log(error);

        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}
