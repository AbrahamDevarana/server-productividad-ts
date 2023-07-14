import { Request, Response } from "express";
import { GaleriaDevarana } from "../models";


export const getGaleriaDevarana = async (req: Request, res: Response) => {

    try {
        const galeria_devarana = await GaleriaDevarana.findAll();        
        res.json({ galeria_devarana });
    } catch (error) {
        res.status(500).json({
            error
        });
    }
}


