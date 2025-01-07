import { Request, Response } from "express";
import { ObjetivoOperativos, PivotOpUsuario, Rendimiento, Usuarios } from "../models";
import { updateRendimiento } from "../helpers/updateRendimiento";
import { Op } from "sequelize";


export const getOrCreateRendimientoByUsuario = async (req: Request, res: Response) => {
    const { usuarioId } = req.params
    const  { quarter, year } = req.query

    try {        

        const usuario = await Usuarios.findOne({
            // OP.Or id or slug
            where: {
                [Op.or]: [
                    { id: usuarioId },
                    { slug: usuarioId }
                ],
                status: 'ACTIVO'
            }
        });

        await updateRendimiento({usuarioId: usuario.id, quarter: Number(quarter), year: Number(year)});
        
        const rendimiento = await Rendimiento.findOrCreate({
            where: {
                usuarioId: usuario.id,
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
                // sino se especifica el año, se obtiene el historial completo
                year: year ? Number(year) : {[Op.gte]: 0},
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
