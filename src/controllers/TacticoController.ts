import { Areas, Comentarios, Departamentos, ObjetivoEstrategico, Perspectivas, Tacticos, Usuarios } from '../models'
import { Request, Response } from 'express'
import { Op } from 'sequelize'
import dayjs from 'dayjs'
import { UsuarioInterface } from '../interfaces'
import { getStatusAndProgress } from '../helpers/getStatusAndProgress'


const includes = [
    {
        model: Departamentos,
        as: 'departamentos',
        attributes: ['id', 'nombre'],
    },
    {
        model: Usuarios,
        as: 'responsables',
        attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'email', 'foto'],
        through: {
            attributes: []
        },
    },
    {
        model: Usuarios,
        as: 'propietario',
        attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'email', 'foto'],
    },
    {
        model: ObjetivoEstrategico,
        as: 'estrategico',
        include: [{
            model: Perspectivas,
            as: 'perspectivas',
            attributes: ['id', 'nombre',  'color']
        }]

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
    },
]

export const getTactico = async (req: Request, res: Response) => {
    const { id } = req.params;    
    try {
        const objetivoTactico = await Tacticos.findOne({
            where: { id },
            include: includes
        })
      
        if (!objetivoTactico) return res.status(404).json({ msg: 'No se encontró el objetivo tactico' })

        res.json({ objetivoTactico });


    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const getTacticosByEstrategia = async (req: Request, res: Response) => {
    const { year, estrategicoId } = req.query;
    const fechaInicio = dayjs(`${year}-01-01`).startOf('year').toDate();
    const fechaFin = dayjs(`${year}-12-31`).endOf('year').toDate();


    const where = {
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
        ],
        // estrategicoId
        estrategicoId: estrategicoId ? estrategicoId : null
    };


    try {
        const objetivosTacticos = await Tacticos.findAll({ 
            where,
            include: [
                {
                    model: Usuarios,
                    as: 'responsables',
                    attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'email', 'foto'],
                    through: {
                        attributes: []
                    },
                },
                {
                    model: Usuarios,
                    as: 'propietario',
                    attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'email', 'foto'],
                }
            ]
        });
        res.json({ objetivosTacticos });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador',
            error
        });
    }
}

export const getTacticosByEquipo = async (req: Request, res: Response) => {
    const { year, departamentoId } = req.query as any;

    const fechaInicio = dayjs(`${year}-01-01`).startOf('year').toDate();
    const fechaFin = dayjs(`${year}-12-31`).endOf('year').toDate();

   

    try {


        const departamento = await Departamentos.findOne({ where: { [Op.or]: [{ id: departamentoId }, { slug: departamentoId }] } })

        const participantes = await departamento?.getUsuario()
        const lider = await departamento?.getLeader()

        const participantesIds = participantes?.map((participante: any) => participante.id);

        const where = {
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
                },
            ],
            [Op.and]: [
                {
                    [Op.or]: [
                        {'$propietario.id$': lider.id},
                        {'$responsables.id$': participantesIds},
                        // [Op.and, {'$responsables.id$': participantesIds}, {'$propietario.id$': lider.id}]
                    ]
                }
            ]
                
        };
        
        
        const objetivosTacticos = await Tacticos.findAll({ 
            where,
            include: [
                {
                    model: Usuarios,
                    as: 'responsables',
                    attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'email', 'foto'],
                    through: {
                        attributes: []
                    }
                },
                {
                    model: Usuarios,
                    as: 'propietario',
                    attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'email', 'foto'],
                }
            ],
            // logging: console.log
            }
        );

        
        res.json({ objetivosTacticos });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador',
            error
        });
        
    }
}

export const createTactico = async (req: Request, res: Response) => {    
    const { slug, year, estrategicoId } = req.body;
    const { id: propietarioId } = req.user as UsuarioInterface

    const fechaInicio = dayjs(`${year}-01-01`).startOf('year').toDate();
    const fechaFin = dayjs(`${year}-12-31`).endOf('year').toDate();
    
    try {

       
        let codigo = ''

        const objetivoTactico = await Tacticos.create({
            propietarioId,
            estrategicoId,
            codigo,
            nombre: 'Nuevo Objetivo Tactico',
            fechaInicio,
            fechaFin,
        });        

        await updateCode({id: objetivoTactico.id, slug})

        await objetivoTactico.reload({
            include: [
                {
                    model: Usuarios,
                    as: 'responsables',
                    attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'email', 'foto'],
                    through: {
                        attributes: []
                    },
                },
                {
                    model: Usuarios,
                    as: 'propietario',
                    attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'email', 'foto'],
                }
            ]
        });
        
        
        res.json({
            objetivoTactico
        });


    }catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const updateTactico = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { nombre, codigo, meta, indicador, status, progreso, responsables , propietarioId, estrategicoId, proyeccion} = req.body;    

    const fechaInicio = dayjs(proyeccion[0]).startOf('quarter').toDate();
    const fechaFin = dayjs(proyeccion[1]).endOf('quarter').toDate();

    const participantes = responsables.map((responsable: any) => {
        if (typeof responsable === 'object') {
            return responsable.id;
        } else {
            return responsable;
        }
    });
    

    try {
        const codigoFinal = codigo;              
        const objetivoTactico = await Tacticos.findByPk(id);
        const { progresoFinal, statusFinal } = getStatusAndProgress({progreso, status, objetivo: objetivoTactico});
        if (!objetivoTactico) return res.status(404).json({ msg: 'No se encontró el objetivo tactico' })

        
        await objetivoTactico.update({ 
            nombre, 
            codigo: codigoFinal,
            meta, 
            indicador,
            estrategicoId: estrategicoId ? estrategicoId : null, 
            status: statusFinal,
            progreso: progresoFinal,
            propietarioId,
            fechaInicio: fechaInicio,
            fechaFin: fechaFin
        });

        await objetivoTactico.setResponsables(participantes);

        await objetivoTactico.reload({ include: includes });

        res.json({
            objetivoTactico
        });


        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const deleteTactico = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const objetivoTactico = await Tacticos.findByPk(id);
        if (objetivoTactico) {
            await objetivoTactico.destroy();
            res.json({
                objetivoTactico
            });
        } else {
            res.status(404).json({
                msg: `No existe un objetivo tactico`
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

// Actualiza el código en base a los objetivos estratégicos y área
export const updateCode = async ({id, slug}: {id:string, slug: string}) => {


    const objetivoTactico = await Tacticos.findByPk(id);
    const area = await Areas.findOne({where: {slug}});

    if( objetivoTactico.estrategicoId ){
        const objetivoEstrategico = await objetivoTactico.getEstrategico()
        const objetivosOperativos = await objetivoEstrategico.getTacticos();
        const totalObjetivosOperativos = objetivosOperativos.length
        objetivoTactico.codigo = `${objetivoEstrategico.codigo}-OT-${totalObjetivosOperativos}`;
        await objetivoTactico.save();                
    }else {
        const totalObjetivosOperativos = await Tacticos.count({
            where: {
                estrategicoId: null
            },
            include: [{
                model: Areas,
                as: 'areas',
                where: {
                    codigo: area?.codigo
                }
            }]
        });
        const codigo = `${area?.codigo}-OT-${totalObjetivosOperativos}`;
        await objetivoTactico.update({codigo});


    }
}
