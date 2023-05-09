import { Request, Response } from "express";
import { Tareas, Hitos, Proyectos, Usuarios } from "../models";
import { Op } from "sequelize";
import { TareaInterface } from "../interfaces";


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
                        attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'iniciales', 'foto'],
                    },
                    {
                        as: 'participantes',
                        model: Usuarios,
                        attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'iniciales', 'foto'],
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

    const { nombre, descripcion, propietarioId, participantesId, fechaFin, fechaInicio, hitoId, propietario, status } = req.body as TareaInterface;

    console.log(req.body);
    


    try {
        const tarea = await Tareas.create({
            nombre,
            descripcion,
            propietarioId,
            fechaFin,
            fechaInicio,
            hitoId,
            propietario,
            status
        });

        await tarea.setParticipantes(participantesId);

        await tarea.reload('propietario', 'participantes');

        res.json({ accion: tarea });

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
    const { nombre, descripcion, propietarioId, participantesId, fechaFin, fechaInicio, hitoId, propietario , status } = req.body as TareaInterface;

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

        await tarea.setParticipantes(participantesId);

        await tarea.reload('propietario', 'participantes');

        res.json({ accion: tarea });

    }
    catch (error) {
        console.log(error);

        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}
