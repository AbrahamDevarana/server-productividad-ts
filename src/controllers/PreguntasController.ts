import { Request, Response } from "express";
import { EvaluacionPregunta } from "../models";


export const getPreguntas = async (req: Request, res: Response) => {

   try {
       const preguntas = await EvaluacionPregunta.findAll();
       res.status(200).json({ ok: true, preguntas });
   }
    catch (error) {
         console.log(error);
         res.status(500).json({ ok: false, msg: 'Error inesperado' });
    }
}

export const getPregunta = async (req: Request, res: Response) => {

    const { id } = req.params;

    try {
        const pregunta = await EvaluacionPregunta.findByPk(id);
        res.status(200).json({ ok: true, pregunta });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ ok: false, msg: 'Error inesperado' });
    }
}

export const createPregunta = async (req: Request, res: Response) => {

    const { nombre, descripcion } = req.body;

    try {
        const pregunta = await EvaluacionPregunta.create({
            nombre,
            descripcion
        });

        res.status(200).json({ ok: true, pregunta });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ ok: false, msg: 'Error inesperado' });
    }
}

export const updatePregunta = async (req: Request, res: Response) => {
    
        const { id } = req.params;
        const { nombre, descripcion } = req.body;
    
        try {
            const pregunta = await EvaluacionPregunta.findByPk(id);
    
            if (!pregunta) {
                return res.status(404).json({
                    ok: false,
                    msg: 'No existe una pregunta con ese id'
                });
            }
    
            await pregunta.update({
                nombre,
                descripcion
            });
    
            res.status(200).json({ ok: true, pregunta });
        }
        catch (error) {
            console.log(error);
            res.status(500).json({ ok: false, msg: 'Error inesperado' });
        }
    }

export const deletePregunta = async (req: Request, res: Response) => {
    
        const { id } = req.params;
    
        try {
            const pregunta = await EvaluacionPregunta.findByPk(id);
    
            if (!pregunta) {
                return res.status(404).json({
                    ok: false,
                    msg: 'No existe una pregunta con ese id'
                });
            }
    
            await pregunta.destroy();
    
            res.status(200).json({ ok: true, pregunta });
        }
        catch (error) {
            console.log(error);
            res.status(500).json({ ok: false, msg: 'Error inesperado' });
        }
    }






