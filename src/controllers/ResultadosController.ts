import { Request, Response } from "express";
import { ResultadosClave } from "../models";
 
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

export const getResultadoClave = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const resultado = await ResultadosClave.findByPk(id);
        
        if (!resultado) {
            return res.status(404).json({
                msg: 'No existe un resultado clave con el id ' + id
            });
        }

        res.json({ resultado });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Hable con el administrador' });
    }
}

export const createResultadosClave = async (req: Request, res: Response) => {
    const { nombre, propietarioId, operativoId, status, progreso, tipoProgreso, fechaInicio, fechaFin } = req.body;

    try {
        const resultadoClave = await ResultadosClave.create({
            nombre,
            progreso,
            tipoProgreso,
            fechaInicio,
            fechaFin,
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
    const { nombre, propietarioId, operativoId, status, progreso, tipoProgreso, fechaInicio, fechaFin} = req.body;

    try {
        const resultado = await ResultadosClave.findByPk(id);

        if (!resultado) {
            return res.status(404).json({
                msg: 'No existe un resultado clave con el id ' + id
            });
        }

        await resultado.update({ nombre, propietarioId, operativoId, status, progreso, tipoProgreso, fechaInicio, fechaFin  });

        res.json({ resultado });
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