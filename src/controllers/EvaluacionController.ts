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
        
        const { nombre, descripcion, status } = req.body;
        
        try {    
            const evaluacion = await Evaluacion.create({ 
                nombre,
                descripcion,
                status
            });


            // TODO: Obtener relaciones con Usuarios y actualizarlas
            

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
    const { nombre, descripcion, status } = req.body;
    
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
            status
        });

        //TODO: Obtener relaciones con Usuarios y actualizarlas
        
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

        await evaluacion.destroy();

        res.json(evaluacion);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "Hable con el administrador",
        });
    }
}
    
