import { ObjetivoEstrategico, Perspectivas, Tacticos, Usuarios } from '../models'
import { Request, RequestHandler, Response } from 'express'
import { Op } from 'sequelize'
import { getPagination, getPagingData } from '../helpers/pagination';


export const getObjetivosEstrategicos:RequestHandler = async (req: Request, res: Response) => {
    

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

export const getObjetivoEstrategico:RequestHandler = async (req: Request, res: Response) => {
    const { id } = req.params;    
    try {
        const objetivoEstrategico = await ObjetivoEstrategico.findByPk(id, { 
        include: [
            {
                model: Tacticos,
                as: 'tacticos',
                include: ['propietario', 'responsables', 'areas']
            },
            {
                model: Usuarios,
                as: 'responsables',
                attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'iniciales', 'foto'],
                through: { attributes: [] }
            },
            {
                model: Usuarios,
                as: 'propietario',
                attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'iniciales', 'foto'],
            },
            {
                model: Perspectivas,
                as: 'perspectivas',
                attributes: ['id', 'nombre', 'icono', 'color', 'status'],
            }

        ]});
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

export const createObjetivoEstrategico:RequestHandler = async (req: Request, res: Response) => {
    const { nombre, codigo, descripcion, indicador, fechaInicio, fechaFin, perspectivaId, responsables = [], propietarioId } = req.body;

    try {
        const objetivoEstrategico = await ObjetivoEstrategico.create({ nombre, codigo, descripcion, fechaInicio, fechaFin, indicador, propietarioId });
        await objetivoEstrategico.setPerspectivas(perspectivaId);
        await objetivoEstrategico.setResponsables(responsables);
        await objetivoEstrategico.reload({
            include: ['perspectivas', 'tacticos', 'responsables', 'propietario']
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

export const updateObjetivoEstrategico:RequestHandler = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { nombre, codigo, descripcion, indicador, fechaInicio, fechaFin, responsables = [], progreso, perspectivaId, status, propietarioId } = req.body;
       

    try {
        const objetivoEstrategico = await ObjetivoEstrategico.findByPk(id);
        if (objetivoEstrategico) {
            await objetivoEstrategico.update({ 
                nombre,
                codigo, 
                descripcion, 
                fechaInicio, 
                fechaFin, 
                progreso, 
                indicador,
                status: status ? status : objetivoEstrategico.status,
                propietarioId
            });

            
            if (perspectivaId) {
                await objetivoEstrategico.setPerspectivas(perspectivaId);
            }

            if (responsables.length > 0) {               
                await objetivoEstrategico.setResponsables(responsables);
            }
     

            await objetivoEstrategico.reload({
                include: ['perspectivas', 'tacticos', 'responsables', 'propietario']
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

export const deleteObjetivoEstrategico:RequestHandler = async (req: Request, res: Response) => {
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

export const getObjetivosEstrategicoByPerspectiva:RequestHandler = async (req: Request, res: Response) => {
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