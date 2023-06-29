import { Request, Response } from "express";
import { Acciones } from "../models";
import { UsuarioInterface } from "../interfaces";
import dayjs from "dayjs";


export const getAcciones = async (req: Request, res: Response) => {
    const {} = req.params;

    let where = {}

    try {
        const acciones = await Acciones.findAll({
            where: {
                ...where,
            },
            order: [['createdAt', 'ASC']],
        });

        res.json({ acciones });
    }
    catch (error) {
        console.log(error);

        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const createAcciones = async (req: Request, res: Response) => {
    const { nombre, resultadoClaveId } = req.body;

    const { id: propietarioId} = req.user as UsuarioInterface

    try {
 
        const accion = await Acciones.create({
            nombre,
            resultadoClaveId,
            propietarioId: propietarioId,
            fechaInicio: dayjs().startOf('quarter').toDate(),
            fechaFin: dayjs().endOf('quarter').toDate(),
            status: 0
        } );

        res.json({ accion });
    }
    catch (error) {
        console.log(error);

        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const updateAcciones = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { nombre, descripcion, propietarioId, resultadoClaveId, status, fechaInicio, fechaFin } = req.body;

    try {
        const accion = await Acciones.findByPk(id);

        if (!accion) {
            return res.status(404).json({
                msg: `No existe una accion con el id ${id}`
            });
        }

        await accion.update({
            nombre,
            descripcion,
            propietarioId,
            resultadoClaveId,
            fechaInicio,
            fechaFin,
            status
        });

        res.json({ accion });
    }
    catch (error) {
        console.log(error);

        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const deleteAcciones = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const accion = await Acciones.findByPk(id);

        if (!accion) {
            return res.status(404).json({
                msg: `No existe una accion con el id ${id}`
            });
        }

        await accion.destroy();

        res.json({ accion });
    }
    catch (error) {
        console.log(error);

        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}