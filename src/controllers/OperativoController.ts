import { Request, Response } from "express";
import { ObjetivoOperativos, Usuarios } from "../models";
import { Op } from "sequelize";



export const getOperativos = async (req: Request, res: Response) => {

    const { tacticoId } = req.params;
    const {} = req.body;

    let where: any = {}

    tacticoId && (where.tacticoId = tacticoId);

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
                    as: 'propietario_op',
                    attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'iniciales'],
                    through: {
                        attributes: ['propietario', 'progresoFinal', 'progresoAsignado', 'progresoReal'],
                        
                    },
                    
                },
                {
                    model: Usuarios,
                    as: 'responsables_op',
                    attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'iniciales'],
                    through: {
                        attributes: ['propietario', 'progresoFinal', 'progresoAsignado', 'progresoReal'],
                    }
                },
            ]
        });


        res.json({ operativos });
    
    } catch (error) {
        console.log(error);
        
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const getProyectos = async (req: Request, res: Response) => {
    const { tacticoId } = req.params;
    const {} = req.body;

    let where: any = {}

    tacticoId && (where.tacticoId = tacticoId);

    try {

        const proyectos = await ObjetivoOperativos.findAll({
            where:{
                ...where,
                tacticoId: null
            },
            order: [['createdAt', 'ASC']],
            include: [
                {
                    model: Usuarios,
                    as: 'propietario_op',
                    attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'iniciales'],
                    through: {
                        attributes: ['propietario', 'progresoFinal', 'progresoAsignado', 'progresoReal'],
                    },
                    
                },
                {
                    model: Usuarios,
                    as: 'responsables_op',
                    attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'iniciales'],
                    through: {
                        attributes: ['propietario', 'progresoFinal', 'progresoAsignado', 'progresoReal'],
                    }
                },
            ]
        });

        res.json({ proyectos });
    
    } catch (error) {
        console.log(error);
        
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const updateOperativo = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { nombre, meta, indicador, fechaInicio, fechaFin, participantes = [] , leaderId = '', tacticoId } = req.body;

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
            tacticoId
        });


        // @ts-ignore
        operativo.setPropietario_op(leaderId);
        // @ts-ignore
        operativo.setResponsables_op(participantes);


        res.json(operativo);
    
    } catch (error) {
        console.log(error);
        
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const createOperativo = async (req: Request, res: Response) => {
    const { nombre, meta, indicador, fechaInicio, fechaFin, participantes = [] , leaderId = '', tacticoId } = req.body;


    try {
        const operativo = await ObjetivoOperativos.create({
            nombre,
            meta,
            indicador,
            fechaInicio,
            fechaFin,
            tacticoId
        });

        // @ts-ignore
        await operativo.setResponsables_op(participantes);
        // @ts-ignore
        await operativo.setPropietario_op(leaderId);

        res.json(operativo);
    
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
