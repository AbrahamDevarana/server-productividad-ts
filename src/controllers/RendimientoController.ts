import { Request, Response } from "express";
import { Rendimiento } from "../models";


export const getOrCreateRendimientoByUsuario = async (req: Request, res: Response) => {

    const  {quarter, year, usuarioId} = req.query as {quarter: string, year: string, usuarioId: string}

    try {
        const rendimiento = await Rendimiento.findOrCreate({
            include: [
            ],
            where: {
                year: Number(year),
                quarter: Number(quarter),
                usuarioId
            }
        });
        res.json({ rendimiento });
    } catch (error) {
        
        console.log(error);
        
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}



