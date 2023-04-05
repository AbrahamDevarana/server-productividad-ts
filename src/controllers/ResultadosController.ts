import { Request, Response } from "express";
import { ResultadosClave } from "../models";
import { Op } from "sequelize";


export const getResultadosClave = async (req: Request, res: Response) => {
    const {  } = req.params;

    let where = {}

    try {
        const resultadosClave = await ResultadosClave.findAll({
            where: {
                ...where,
            },
            order: [['createdAt', 'ASC']],
        });

        res.json({ resultadosClave });
    }
    catch (error) {
        console.log(error);

        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const createResultadosClave = async (req: Request, res: Response) => {
    const { nombre, descripcion, propietarioId, operativoId, status } = req.body;

    try {
        const resultadoClave = await ResultadosClave.create({
            nombre,
            descripcion,
            propietarioId,
            operativoId,
            status
        });

        res.json({ resultadoClave });
    }
    catch (error) {
        console.log(error);

        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const updateResultadosClave = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { nombre, descripcion, propietarioId, operativoId, status } = req.body;

    try {
        const resultadoClave = await ResultadosClave.findByPk(id);

        if (!resultadoClave) {
            return res.status(404).json({
                msg: 'No existe un resultado clave con el id ' + id
            });
        }

        await resultadoClave.update({ nombre, descripcion, propietarioId, operativoId, status });

        res.json({ resultadoClave });
    }
    catch (error) {
        console.log(error);

        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const deleteResultadosClave = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const resultadoClave = await ResultadosClave.findByPk(id);

        if (!resultadoClave) {
            return res.status(404).json({
                msg: 'No existe un resultado clave con el id ' + id
            });
        }

        await resultadoClave.destroy();

        res.json({ resultadoClave });
    }
    catch (error) {
        console.log(error);

        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}