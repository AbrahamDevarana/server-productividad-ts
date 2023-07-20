import { Request, Response } from "express";
import { Perspectivas, ObjetivoEstrategico, Usuarios, Tacticos, Comentarios } from "../models";
import dayjs from "dayjs";
import { Op } from "sequelize";

export const getPerspectivas = async (req: Request, res: Response) => {
   
    const { year } = req.query;

    const fechaInicio = dayjs(`${year}-01-01`).startOf('year').toDate();
    const fechaFin = dayjs(`${year}-12-31`).endOf('year').toDate();
    

    const where: any = {};
    try {

        const perspectivas = await Perspectivas.findAll({
            where,
            order: [['orden', 'ASC']],
            include: [
                {
                    model: ObjetivoEstrategico,
                    as: 'objetivosEstrategicos',
                    include: [
                        {
                            model: Usuarios,
                            as: 'responsables',
                            attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'iniciales', 'foto'],
                        },
                        {
                            model: Tacticos,
                            as: 'tacticos',
                        },
                        {
                            model: Usuarios,
                            as: 'propietario',
                            attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'iniciales', 'foto'],
                        },
                        {
                            model: Comentarios,
                            as: 'comentarios',
                            attributes: ['id', 'mensaje', 'createdAt'],
                            include: [
                                {
                                    as: 'autor',
                                    model: Usuarios,
                                    attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'iniciales', 'foto'],
                                }
                            ]
                        }
                    ],
                    required: false,
                    where: {
                        [Op.or]: [
                            {
                                fechaInicio: {
                                    [Op.between]: [fechaInicio, fechaFin]
                                }
                            },
                            {
                                fechaFin: {
                                    [Op.between]: [fechaInicio, fechaFin]
                                }
                            }   
                        ]
                    }
                }
            ],
        });       

        res.json({ perspectivas });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const getPerspectiva = async (req: Request, res: Response) => {
    
    const { id } = req.params;

    try {
        const perspectiva = await Perspectivas.findByPk(id, { include: [] });
        if (perspectiva) {
            res.json({ perspectiva });
        } else {
            res.status(404).json({
                msg: `No existe la perspectiva seleccionada`
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const createPerspectiva = async (req: Request, res: Response) => {
    
    const { nombre, descripcion, color } = req.body;

    try {
        const perspectiva = await Perspectivas.create({ nombre, descripcion, color});

        perspectiva.reload({ include: [] });
        res.json({ perspectiva });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const updatePerspectiva = async (req: Request, res: Response) => {
        
    const { id } = req.params;
    const { nombre, descripcion, color } = req.body;    

    try {
        const perspectiva = await Perspectivas.findByPk(id, { include: [] });
        if (perspectiva) {
            await perspectiva.update({ nombre, descripcion, color })
            
            res.json({ perspectiva });
        } else {
            res.status(404).json({
                msg: `No existe la perspectiva seleccionada`
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const deletePerspectiva = async (req: Request, res: Response) => {
        
    const { id } = req.params;

    try {
        const perspectiva = await Perspectivas.findByPk(id, { include: [] });
        if (perspectiva) {
            await perspectiva.destroy();
            res.json({ perspectiva });
        } else {
            res.status(404).json({
                msg: `No existe la perspectiva seleccionada`
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}