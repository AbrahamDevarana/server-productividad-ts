import { Request, Response } from "express";
import { Evaluacion } from "../models";



export const getEvaluaciones = async (req: Request, res: Response) => {
    
    const {} = req.query;

    try {
        const evaluaciones = await Evaluacion.findAll();
        res.json({ evaluaciones });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "Hable con el administrador",
        });
    }
}

export const getEvaluacion = async (req: Request, res: Response) => {
        
        const { id } = req.params;
    
        try {
            const evaluacion = await Evaluacion.findByPk(id);
            if (evaluacion) {
                res.json({ evaluacion });
            } else {
                res.status(404).json({
                    msg: `No existe un evaluacion con el id ${id}`,
                });
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({
                msg: "Hable con el administrador",
            });
        }
}

export const createEvaluacion = async (req: Request, res: Response) => {
        
        const { nombre, descripcion, status, tipoEvaluacionId, preguntas = []} = req.body;
        
        try {    
            const evaluacion = await Evaluacion.create({ 
                nombre,
                tipoEvaluacionId,
                descripcion,
                status
            });

            preguntas.length > 0 && await evaluacion.setPreguntas(preguntas);
        
            res.json(evaluacion);
        } catch (error) {
            console.log(error);
            res.status(500).json({
                msg: "Hable con el administrador",
            });
        }
}

export const updateEvaluacion = async (req: Request, res: Response) => {
        
    const { id } = req.params;
    const { nombre, descripcion, tipoEvaluacionId, status, preguntas = [] } = req.body;
    
    try {
        const evaluacion = await Evaluacion.findByPk(id);
        if (!evaluacion) {
            return res.status(404).json({
                msg: `No existe un evaluacion`,
            });
        }

        await evaluacion.update({
            nombre,
            descripcion,
            tipoEvaluacionId,
            status
        });

        preguntas.length > 0 && await evaluacion.setPreguntas(preguntas);
        res.json(evaluacion);

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "Hable con el administrador",
        });
    }
}

export const deleteEvaluacion = async (req: Request, res: Response) => {

    const { id } = req.params;
    try {
        const evaluacion = await Evaluacion.findByPk(id);
        if (!evaluacion) {
            return res.status(404).json({
                msg: `No existe un evaluacion`,
            });
        }

        await evaluacion.update({
            status: false
        });

        res.json(evaluacion);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "Hable con el administrador",
        });
    }
}

