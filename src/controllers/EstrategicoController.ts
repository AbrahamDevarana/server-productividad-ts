import { Comentarios, ObjetivoEstrategico, Perspectivas, Tacticos, Usuarios } from '../models'
import { Request, RequestHandler, Response } from 'express'
import { Op } from 'sequelize'
import { getPagination, getPagingData } from '../helpers/pagination';
import { UsuarioInterface } from '../interfaces';
import dayjs from 'dayjs';
import { getStatusAndProgress } from '../helpers/getStatusAndProgress';


const includeProps = [
    // {
    //     model: Tacticos,
    //     as: 'tacticos',
    //     include: ['propietario', 'responsables', 'areas']
    // },
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
    const { year } = req.query;
    const fechaInicio = dayjs(`${year}-01-01`).startOf('year').toDate();
    const fechaFin = dayjs(`${year}-12-31`).endOf('year').toDate();
    
    try {
        const objetivosEstrategicos = await ObjetivoEstrategico.findAll({
            include: [{
                    model: Perspectivas,
                    as: 'perspectivas',
                },
                'responsables'
        ],
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
        });        
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
    const { perspectivaId, year } = req.body;

    const { id: propietarioId} = req.user as UsuarioInterface
        // Primer dia del año actual
        const fechaInicio = dayjs(`${year}-01-01`).startOf('year').toDate();
        const fechaFin = dayjs(`${year}-12-31`).endOf('year').toDate();
        

    try {
        const objetivoEstrategico = await ObjetivoEstrategico.create({ propietarioId,  perspectivaId, fechaInicio, fechaFin });
        await objetivoEstrategico.reload({
            include: includeProps
        });


        
        res.json({
            objetivoEstrategico,
            perspectivaId,
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
            const { progresoFinal, statusFinal } = getStatusAndProgress({progreso, status, objetivo: objetivoEstrategico});

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