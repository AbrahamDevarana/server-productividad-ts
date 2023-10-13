import { Request, Response } from "express";
import { ObjetivoOperativos, PivotOpUsuario, Rendimiento } from "../models";
import { updateRendimiento } from "../helpers/updateRendimiento";


export const getOrCreateRendimientoByUsuario = async (req: Request, res: Response) => {
    const { usuarioId } = req.params
    const  { quarter, year } = req.query

    try {        

        await updateRendimiento({usuarioId, quarter: Number(quarter), year: Number(year)});
        
        const rendimiento = await Rendimiento.findOrCreate({
            where: {
                usuarioId,
                quarter: Number(quarter),
                year: Number(year)
            }
        });

        res.json({rendimiento: rendimiento[0]});

    } catch (error) {
        console.log(error);
        
        res.status(500).json({msg: 'Error al obtener el rendimiento del usuario'});
    }
}

export const getHistorialRendimientoThunk = async (req: Request, res: Response) => {
    const { year } = req.query
    const { usuarioId } = req.params as {usuarioId: string}
    try {
        const rendimientos = await Rendimiento.findAll({
            where: {
                year: Number(year),
                usuarioId
            }
        });
    
        res.json({rendimientos});

    } catch (error) {
        res.status(500).json({msg: 'Error al obtener el rendimiento del usuario'});
    }
}

export const cerrarCiclo = async (req: Request, res: Response) => {
    
        const {usuarioId} = req.params as {usuarioId: string}
    
        const  {quarter, year } = req.query as {quarter: string, year: string}
    
        try {
            const rendimiento = await Rendimiento.update({
                status: 'CERRADO'
            }, {
                where: {
                    usuarioId,
                    quarter,
                    year
                }
            });

            const objetivos = await ObjetivoOperativos.findAll({
                where: {
                    quarter,
                    year
                }
            });

            for (const objetivo of objetivos) {

                const pivot = await PivotOpUsuario.findAll({
                    where: {
                        objetivoOperativoId: objetivo.id,
                        usuarioId
                    }
                });

                for (const resultado of pivot) {
                    await resultado.update({
                        status: 'FINALIZADO'
                    });
                }



                await objetivo.update({
                    status: 'CERRADO'
                });
            }

    

        res.json({rendimiento});

    
        } catch (error) {
            res.status(500).json({msg: 'Error al obtener el rendimiento del usuario'});
        }
}
