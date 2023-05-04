import { Request, Response } from "express";
import { AccionesProyecto, Hitos, Proyectos, Usuarios } from "../models";
import { Op } from "sequelize";
import { Accion } from "../interfaces/AccionPoryecto";


export const getAccionProyecto = async (req: Request, res: Response) => {
    const { id } = req.params;

    let where = {}

    try {
        const accion = await AccionesProyecto.findByPk(id,
            {
                include: [
                    {
                        as: 'propietario',
                        model: Usuarios,
                        attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'iniciales', 'foto'],
                    }
                ]
            });
        // obtener proyecto al que corresponden las acciones 

        res.json({ accion });
    }
    catch (error) {
        console.log(error);

        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}


export const updateAccionProyecto = async (req: Request, res: Response) => {

    const { id } = req.params;
    const { nombre, descripcion, propietarioId, fechaFin, fechaInicio, hitoId, propietario , status } = req.body as Accion;

    try {
        const accion = await AccionesProyecto.findByPk(id);

        if (!accion) {
            return res.status(404).json({
                msg: 'No existe una accion con el id ' + id
            });
        }

        await accion.update({
            nombre,
            descripcion,
            propietarioId,
            fechaFin,
            fechaInicio,
            hitoId,
            propietario,
            status
        });

        await accion.reload('propietario');

        res.json({ accion });

    }
    catch (error) {
        console.log(error);

        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}
