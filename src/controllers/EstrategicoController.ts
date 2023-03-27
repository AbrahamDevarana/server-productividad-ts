import { ObjetivoEstrategico, Perspectivas } from '../models'
import { Request, Response } from 'express'
import { Op } from 'sequelize'
import { getPagination, getPagingData } from '../helpers/pagination';


export const getObjetivosEstrategicos = async (req: Request, res: Response) => {

    const {page = 0, size = 5, nombre, fechaInicio, fechaFin, status, idPerspectiva} = req.query;    
    const {limit, offset} = getPagination(Number(page), Number(size));

    const where: any = {};
    const wherePerspectiva: any = {};

    nombre && (where.nombre = { [Op.like]: `%${nombre}%` });
    fechaInicio && (where.fechaInicio = { [Op.gte]: fechaInicio });
    fechaFin && (where.fechaFin = { [Op.lte]: fechaFin });

    status && (where.status = status);


    idPerspectiva && (wherePerspectiva.id = idPerspectiva);
    

    try {
        
        const result = await ObjetivoEstrategico.findAndCountAll({
            include: [{
                    model: Perspectivas,
                    as: 'perspectivas',
                    through: { attributes: [] },
                    where: wherePerspectiva,
                },
                'responsables'
        ],
            where,
        });

        const objetivosEstrategicos = getPagingData(result, Number(page), Number(size))

        res.json({
            objetivosEstrategicos
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const getObjetivoEstrategico = async (req: Request, res: Response) => {
    const { id } = req.params;    
    try {
        const objetivoEstrategico = await ObjetivoEstrategico.findByPk(id, { include: ['perspectivas', 'tacticos', 'responsables'] });
        if (objetivoEstrategico) {

            res.json({
                objetivoEstrategico
            });
        } else {
            res.status(404).json({
                msg: `No existe un objetivo estrategico con el id ${id}`
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const createObjetivoEstrategico = async (req: Request, res: Response) => {
    const { nombre, codigo, descripcion, indicador, fechaInicio, fechaFin, perspectivaId, responsables = [] } = req.body;

    try {
        const objetivoEstrategico = await ObjetivoEstrategico.create({ nombre, codigo, descripcion, fechaInicio, fechaFin, indicador });
        await objetivoEstrategico.setPerspectivas(perspectivaId);
        await objetivoEstrategico.setResponsables(responsables);
        await objetivoEstrategico.reload({
            include: ['perspectivas', 'tacticos', 'responsables']
        });
     
        res.json({
            objetivoEstrategico,
            perspectivaId
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const updateObjetivoEstrategico = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { nombre, codigo, descripcion, indicador, fechaInicio, fechaFin, responsables = [], progreso, perspectivaId } = req.body;

    try {
        const objetivoEstrategico = await ObjetivoEstrategico.findByPk(id);
        if (objetivoEstrategico) {
            await objetivoEstrategico.update({ nombre, codigo, descripcion, fechaInicio, fechaFin, progreso, indicador });
            await objetivoEstrategico.setResponsables(responsables);
            await objetivoEstrategico.setPerspectivas(perspectivaId);

            await objetivoEstrategico.reload({
                include: ['perspectivas', 'tacticos', 'responsables']
            });

            res.json({
                objetivoEstrategico
            });
        } else {
            res.status(404).json({
                msg: `No existe un objetivo estrategico con el id ${id}`
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const deleteObjetivoEstrategico = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const objetivoEstrategico = await ObjetivoEstrategico.findByPk(id);
        if (objetivoEstrategico) {
            await objetivoEstrategico.destroy();
            res.json({
                objetivoEstrategico
            });
        } else {
            res.status(404).json({
                msg: `No existe un objetivo estrategico con el id ${id}`
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const getObjetivosEstrategicoByPerspectiva = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const objetivoEstrategico = await ObjetivoEstrategico.findAll({ 
            include: [{
                model: Perspectivas,
                as: 'perspectivas',
                where: { id: id },
                attributes: [],
                through: { attributes: [] }
            }],
        });
        if (objetivoEstrategico) {
            res.json({
                objetivoEstrategico
            });
        } else {
            res.status(404).json({
                msg: `No existe un objetivo estrategico con el id ${id}`
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}