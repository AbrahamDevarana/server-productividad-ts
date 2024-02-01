import { Areas, Comentarios, ObjetivoEstrategico, Perspectivas, Tacticos, Usuarios } from '../models'
import { Request, RequestHandler, Response } from 'express'
import { Op } from 'sequelize'
import { UsuarioInterface } from '../interfaces';
import dayjs from 'dayjs';
import { getStatusAndProgress } from '../helpers/getStatusAndProgress';


const includeProps = [

    {
        model: Usuarios,
        as: 'responsables',
        attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'iniciales', 'email', 'foto', 'slug'],
        through: { attributes: [] }
    },
    {
        model: Usuarios,
        as: 'propietario',
        attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'iniciales', 'email', 'foto', 'slug'],
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
                attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'iniciales', 'email', 'foto', 'slug'],
            }
        ]
    }
]

export const getObjetivosEstrategicos:RequestHandler = async (req: Request, res: Response) => {
    const { year, perspectivaId } = req.query;
    

    try {
        const objetivosEstrategicos = await ObjetivoEstrategico.findAll({
            where: {
                year,
                // si no se envia perspectivaId, se obtienen todos los objetivos estrategicos
                ...(perspectivaId && { perspectivaId })
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
        
            let promedio = 0;
            let totalProgress = 0;
            let totalTacticos = 0;


            const objetivosTacticos = await Tacticos.findAll({
                where: {
                    estrategicoId: id
                }
            });

            for( const objetivoTactico of objetivosTacticos) {
                totalProgress += objetivoTactico.progreso;
                totalTacticos++;
            }

         
            promedio = totalTacticos > 0 ? Math.round(totalProgress / totalTacticos) : 0;

            if(objetivoEstrategico.typeProgress === 'PROMEDIO') {
                objetivoEstrategico.progreso = promedio;
                await objetivoEstrategico.save();
                await objetivoEstrategico.reload({ include: includeProps });
            }

            objetivoEstrategico.setDataValue('suggest', promedio);

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

    console.log(req.body);
    

    try {
        const objetivoEstrategico = await ObjetivoEstrategico.create({ propietarioId,  perspectivaId, year });
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
    const { nombre, codigo, descripcion, indicador, responsables = [], progreso, perspectivaId, status, propietarioId, tipoProgreso, year} = req.body;
    
    
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

            let promedio = 0;
            let totalProgress = 0;
            let totalTacticos = 0;

            const { progresoFinal, statusFinal } = getStatusAndProgress({progreso, status, objetivo: objetivoEstrategico});

            await objetivoEstrategico.update({ 
                nombre,
                codigo, 
                descripcion, 
                progreso: progresoFinal,
                indicador,
                tipoProgreso,
                status: statusFinal,
                propietarioId,
                year
            });

            const objetivosTacticos = await Tacticos.findAll({
                where: {
                    estrategicoId: id,
                }
            });

            for( const objetivoTactico of objetivosTacticos) {
                totalProgress += objetivoTactico.progreso;
                totalTacticos++;
            }

            promedio = totalTacticos > 0 ? Math.round(totalProgress / totalTacticos) : 0;
            
            if (perspectivaId) {
                await objetivoEstrategico.setPerspectivas(perspectivaId);
            }

            await objetivoEstrategico.setResponsables(participantes);

            await objetivoEstrategico.reload({
                include: includeProps
            });

            
            objetivoEstrategico.setDataValue('suggest', promedio);

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
    
    throw new Error('No implementado');
    
    try {
        const objetivoEstrategico = await ObjetivoEstrategico.findAll({ 
            include: [{
                model: Perspectivas,
                as: 'perspectivas',
                where: { id },
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

export const getObjetivosEstrategicoByArea:RequestHandler = async (req: Request, res: Response) => {
    const { year, slug } = req.query;

    try {
        const area = await Areas.findOne({
            where: { slug },
        });

        const perspectiva = await area.getPerspectivas()

        const objetivosEstrategicos = await ObjetivoEstrategico.findAll({
            where: {
                year,
                perspectivaId: perspectiva.id
            },
            include: [{
                model: Perspectivas,
                as: 'perspectivas',
                attributes: ['id', 'nombre', 'icono', 'color', 'status'],
            }],
        });

    
        res.json({
            objetivosEstrategicos,
        });
    
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }

    

}

export const changeTypeProgress:RequestHandler = async (req: Request, res: Response) => {

    const  { estrategicoId, typeProgress } = req.body;
    
    let promedio = 0

    try {
        const objetivoEstrategico = await ObjetivoEstrategico.findByPk(estrategicoId);
        if (objetivoEstrategico) {
            await objetivoEstrategico.update({ 
                tipoProgreso: typeProgress
            });


            if(typeProgress === 'PROMEDIO') {

                let totalProgress = 0;
                let totalTacticos = 0;
    
    
                const objetivosTacticos = await Tacticos.findAll({
                    where: {
                        estrategicoId: estrategicoId
                    }
                });
    
                for( const objetivoTactico of objetivosTacticos) {
                    totalProgress += objetivoTactico.progreso;
                    totalTacticos++;
                }
    
             
                promedio = totalTacticos > 0 ? Math.round(totalProgress / totalTacticos) : 0;
    
                // objetivoEstrategico.suggest = promedio;
                objetivoEstrategico.progreso = promedio;
            }
            
            await objetivoEstrategico.save();
            await objetivoEstrategico.reload({ include: includeProps });
            
            objetivoEstrategico.setDataValue('suggest', promedio);
            

            res.json({
                objetivoEstrategico
            });
        } else {
            res.status(404).json({
                msg: `No existe un objetivo estratégico ${estrategicoId}`
            });
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}