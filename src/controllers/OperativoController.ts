import { Request, Response } from "express";
import { ObjetivoOperativos, Usuarios, ResultadosClave } from "../models";
import { Op } from "sequelize";


export const getOperativos = async (req:any, res: Response) => {

    const { tacticoId } = req.params;
    const {} = req.body;
    
    let where: any = {}
    
    tacticoId && (where.tacticoId = tacticoId);
    
    // meter al where

    if (true){
        where[Op.or] = [
            { propietarioId: req.user.id },
            { '$operativosResponsable.id$': req.user.id }
        ]

    }

    try {
        const operativos = await ObjetivoOperativos.findAll({
            where: {
                ...where,
                tacticoId: { [Op.ne]: null }
            },
            order: [['createdAt', 'ASC']],
            include: [
                {
                    model: Usuarios,
                    as: 'operativosResponsable',
                    attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'iniciales', 'email', 'foto'],
                    through: {
                        attributes: ['propietario', 'progresoFinal', 'progresoAsignado', 'progresoReal'],
                        as: 'scoreCard'
                    },
                },
                {
                    model: Usuarios,
                    as: 'operativoPropietario',
                    attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'iniciales', 'email', 'foto'],
                },
                {
                    model: ResultadosClave,
                    as: 'resultadosClave',
                    attributes: ['id', 'nombre', 'progreso', 'tipoProgreso', 'fechaInicio', 'fechaFin', 'operativoId', 'status'],
                }
            ],
            logging: console.log
        });
      

        res.json({ operativos });
    
    } catch (error) {
        console.log(error);
        
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const updateOperativo = async (req: Request, res: Response) => {
    const { id } = req.params;

    const { nombre, meta, indicador, fechaInicio, fechaFin, operativosResponsable = [] , propietarioId = '', tacticoId, status } = req.body;

    console.log(operativosResponsable);
    

    try {
        const operativo = await ObjetivoOperativos.findByPk(id);
        if (!operativo) {
            return res.status(404).json({
                msg: `No existe un operativo con el id ${id}`
            });
        }

        await operativo.update({
            nombre,
            meta,
            indicador,
            fechaInicio,
            fechaFin,
            tacticoId,
            propietarioId,
        });


        // @ts-ignore
        await operativo.setOperativosResponsable(operativosResponsable);
        await operativo.reload( { include: 
            ['operativosResponsable', 'operativoPropietario', 'resultadosClave']
        } );


        res.json({operativo});
    
    } catch (error) {
        console.log(error);
        
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const createOperativo = async (req: Request, res: Response) => {
    
    const { nombre, meta, indicador, fechaInicio, fechaFin, operativosResponsable = [] , propietarioId = '', tacticoId } = req.body;
    const participantesIds = operativosResponsable.map((responsable: any) => responsable.id);

    try {

        const operativo = await ObjetivoOperativos.create({
            nombre,
            meta,
            indicador,
            fechaInicio,
            fechaFin,
            tacticoId,
            propietarioId,
        });

        
        // @ts-ignore
        await operativo.setOperativosResponsable(participantesIds);
        await operativo.reload( { include: 
            ['operativosResponsable', 'operativoPropietario', 'resultadosClave']
        } );
       

        res.json({operativo});
    
    } catch (error) {
        console.log(error);
        
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const deleteOperativo = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const operativo = await ObjetivoOperativos.findByPk(id);
        if (!operativo) {
            return res.status(404).json({
                msg: `No existe un operativo con el id ${id}`
            });
        }

        await operativo.destroy();

        res.json(operativo);
    
    } catch (error) {
        console.log(error);
        
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const getObjetivo = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const operativo = await ObjetivoOperativos.findByPk(id, {
            include: [
                {
                    model: Usuarios,
                    as: 'operativosResponsable',
                    attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'iniciales', 'email', 'foto'],
                    through: {
                        attributes: ['propietario', 'progresoFinal', 'progresoAsignado', 'progresoReal'],
                        as: 'scoreCard'
                    },
                },
                {
                    model: Usuarios,
                    as: 'operativoPropietario',
                    attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'iniciales', 'email', 'foto'],
                },
                {
                    model: ResultadosClave,
                    as: 'resultadosClave',
                    attributes: ['id', 'nombre', 'progreso', 'tipoProgreso', 'fechaInicio', 'fechaFin', 'operativoId', 'status'],
                }
            ]
        });
        if (!operativo) {
            return res.status(404).json({
                msg: `No existe un operativo con el id ${id}`
            });
        }

        res.json({operativo});
    
    } catch (error) {
        console.log(error);
        
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}