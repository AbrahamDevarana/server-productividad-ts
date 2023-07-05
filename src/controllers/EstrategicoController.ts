import { Comentarios, ObjetivoEstrategico, Perspectivas, Tacticos, Usuarios } from '../models'
import { Request, RequestHandler, Response } from 'express'
import { Op } from 'sequelize'
import { getPagination, getPagingData } from '../helpers/pagination';
import { UsuarioInterface } from '../interfaces';


const includeProps = [
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
]


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
        include: includeProps 
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

export const createObjetivoEstrategico:RequestHandler = async (req: Request, res: Response) => {
    const { perspectivaId } = req.body;

    console.log(perspectivaId);
    

    const { id: propietarioId} = req.user as UsuarioInterface

    try {
        const objetivoEstrategico = await ObjetivoEstrategico.create({ propietarioId,  perspectivaId });
        await objetivoEstrategico.reload({
            include: includeProps
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



    let progresoFinal = progreso;
    let statusFinal = status;

    const participantes = responsables.map((responsable: any) => {
        if (typeof responsable === 'object') {
            return responsable.id;
        } else {
            return responsable;
        }
    });

    
    try {
        const objetivoEstrategico = await ObjetivoEstrategico.findByPk(id);
        if (objetivoEstrategico) {
            if(status !== objetivoEstrategico.status){
                if(status === 'FINALIZADO'){
                    progresoFinal = 100;
                    statusFinal = 'FINALIZADO';
                }else if (status === 'EN PROGRESO'){
                    statusFinal = 'EN PROGRESO';
                }else if ( status === 'SIN_INICIAR'){
                    progresoFinal = 0;
                    statusFinal = 'SIN_INICIAR';
                }else if (status === 'EN_TIEMPO' || status === 'CANCELADO' || status === 'EN_PAUSA' || status === 'RETRASADO'){
                    statusFinal = status;
                    if(objetivoEstrategico.progreso === 100){
                        progresoFinal = 99;
                    } else if (objetivoEstrategico.progreso === 0){
                        progresoFinal = 1;
                    }
                }
            }

            if(progreso !== objetivoEstrategico.progreso){

                if(progreso === 100){
                    statusFinal = 'FINALIZADO';
                }else if (progreso === 0){
                    statusFinal = 'SIN_INICIAR';
                }else if (progreso > 0 && progreso < 100){
                    statusFinal = 'EN_TIEMPO';
                }
            }




            await objetivoEstrategico.update({ 
                nombre,
                codigo, 
                descripcion, 
                fechaInicio, 
                fechaFin, 
                progreso: progresoFinal,
                indicador,
                status: statusFinal,
                propietarioId
            });

            
            if (perspectivaId) {
                await objetivoEstrategico.setPerspectivas(perspectivaId);
            }

            if (participantes.length > 0) {
                await objetivoEstrategico.setResponsables(participantes);
            }
     

            await objetivoEstrategico.reload({
                include: includeProps
            });

            res.json({
                objetivoEstrategico
            });
        } else {
            res.status(404).json({
                msg: `No existe un objetivo estratégico ${id}`
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