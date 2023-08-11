import { Request, Response } from "express";
import { EvaluacionPreguntas } from "../models";


export const getEvaluacionPreguntas = async (req: Request, res: Response) => {
    try {
        const evaluacionPreguntas = await EvaluacionPreguntas.findAll();
        res.json(evaluacionPreguntas);
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Error al obtener las preguntas de la evaluacion' });
    }
}

export const getEvaluacionPregunta = async (req: Request, res: Response) => {

    const { id } = req.params;

    try {
        const evaluacionPregunta = await EvaluacionPreguntas.findByPk(id);
        if (evaluacionPregunta) {
            res.json(evaluacionPregunta);
        } else {
            res.status(404).json({ msg: `No existe la pregunta` });
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Error al obtener la pregunta de la evaluacion' });
    }
}

export const createEvaluacionPregunta = async (req: Request, res: Response) => {
    const { pregunta, descripcion, informacionAdicional } = req.body;
    try {
        const evaluacionPregunta = await EvaluacionPreguntas.create({
            pregunta,
            descripcion,
            informacionAdicional
        });

        res.json(evaluacionPregunta);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Error al crear la pregunta de la evaluacion' });
    }
}


export const updateEvaluacionPregunta = async (req: Request, res: Response) => {
    const { id } = req.params;

    const { pregunta, descripcion, informacionAdicional } = req.body;

    try {
        const evaluacionPregunta = await EvaluacionPreguntas.findByPk(id);
        if (!evaluacionPregunta) {
            return res.status(404).json({ msg: 'No existe la pregunta' });
        }

        await evaluacionPregunta.update({
            pregunta,
            descripcion,
            informacionAdicional
        });

        res.json(evaluacionPregunta);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Error al actualizar la pregunta de la evaluacion' });
    }
}

export const deleteEvaluacionPregunta = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const evaluacionPregunta = await EvaluacionPreguntas.findByPk(id);
        if (!evaluacionPregunta) {
            return res.status(404).json({ msg: 'No existe la pregunta' });
        }

        await evaluacionPregunta.destroy();

        res.json(evaluacionPregunta);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Error al eliminar la pregunta de la evaluacion' });
    }
}