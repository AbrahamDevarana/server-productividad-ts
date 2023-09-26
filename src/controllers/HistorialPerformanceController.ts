import { Request, Response } from "express";
import { UsuarioInterface } from "../interfaces";
import { HistorialPerformance } from "../models/HistorialPerformance";


export const createHstorial = async (req: Request, res: Response) => {
    const { quarter, year, total } = req.body;
    const { id } = req.user as UsuarioInterface;
    try {
        const historial = await HistorialPerformance.create({
            quarter,
            year,
            total,
            usuarioId: id
        });
        res.json({ historial });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const getHistorial = async (req: Request, res: Response) => {

    const { year } = req.params;
    const { id } = req.user as UsuarioInterface;
    
    try {
        const historial = await HistorialPerformance.findAll({
            where: {
                usuarioId: id,
                year
            }
        });
        res.json({ historial });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}
