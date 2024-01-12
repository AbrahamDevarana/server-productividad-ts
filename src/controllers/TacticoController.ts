import { Areas, Comentarios, Departamentos, ObjetivoEstrategico, ObjetivoOperativos, Perspectivas, ResultadosClave, Tacticos, Usuarios } from '../models'
import { Request, Response } from 'express'
import { Op, Sequelize, WhereOptions } from 'sequelize'
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

        let totalProgress = 0;
        let totalResultadosClave = 0;
        let promedio = 0;

        const objetivoOperativos = await ObjetivoOperativos.findAll({ where: { tacticoId: objetivoTactico.id } });

        for (const objetivoOperativo of objetivoOperativos) {
            const resultadosClave = await ResultadosClave.findAll({
              where: { operativoId: objetivoOperativo.id }
            });
            // Accumulate progress and count the key results
            for (const resultadoClave of resultadosClave) {
              totalProgress += resultadoClave.progreso;
              totalResultadosClave++;
            }
        }

        promedio = totalResultadosClave > 0 ? Math.round(totalProgress / totalResultadosClave) : 0;

        if(objetivoTactico.tipoProgreso === 'PROMEDIO'){
            objetivoTactico.progreso = promedio;
            await objetivoTactico.save();
            await objetivoTactico.reload({ include: includes });
        }
         
        

        objetivoTactico.setDataValue('suggest', promedio);        

        res.json({ objetivoTactico });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const getTacticosByEstrategia = async (req: Request, res: Response) => {
    const { year, estrategicoId, showOnlyMe } = req.query
    const fechaInicio = dayjs(`${year}-01-01`).startOf('year').toDate();
    const fechaFin = dayjs(`${year}-12-31`).endOf('year').toDate();

    const {id: propietarioId} = req.user as UsuarioInterface
    

    let where: WhereOptions = {
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
        estrategicoId: estrategicoId,
        tipoObjetivo: 'ESTRATEGICO',
    };

    if (showOnlyMe === "true") {
        where = {
            ...where,
            [Op.or]: [
                { '$propietario.id$': propietarioId },
                { '$responsables.id$': propietarioId }
            ]
        };
    }


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
    const { year, departamentoId, showOnlyMe } = req.query as any;

    const fechaInicio = dayjs(`${year}-01-01`).startOf('year').toDate();
    const fechaFin = dayjs(`${year}-12-31`).endOf('year').toDate();
    const {id: propietarioId} = req.user as UsuarioInterface

    try {
        const departamento = await Departamentos.findOne({ where: { [Op.or]: [{ id: departamentoId }, { slug: departamentoId }] } })

        const participantes = await departamento?.getUsuario()
        const lider = await departamento?.getLeader()

        const participantesIds = participantes?.map((participante: any) => participante.id);
        let where : WhereOptions = {
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
                        
                        {'$responsables.id$': participantesIds },
                    ]
                },
                showOnlyMe === "true" ? { 
                    [Op.or]: [
                        { '$propietario.id$': propietarioId },
                        { '$responsables.id$': propietarioId }
                    ]
                } : {}
            ],
            tipoObjetivo: 'ESTRATEGICO'    
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
            }
        );

        const finalTacticos = await Tacticos.findAll({
            where: {
                id: [objetivosTacticos.map((tactico: any) => tactico.id)],
            },
            include: includes
        });
        
        res.json({ objetivosTacticos:finalTacticos });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador',
            error
        });
        
    }
}

export const getTacticosCoreByEquipo = async (req: Request, res: Response) => {
    
    const { year, departamentoId, showOnlyMe } = req.query as any;
    const fechaInicio = dayjs(`${year}-01-01`).startOf('year').toDate();
    const fechaFin = dayjs(`${year}-12-31`).endOf('year').toDate();
    const {id: propietarioId} = req.user as UsuarioInterface

    try {
        const departamento = await Departamentos.findOne({ where: { [Op.or]: [{ id: departamentoId }, { slug: departamentoId }] } })

        const participantes = await departamento?.getUsuario()
        const lider = await departamento?.getLeader()

        const participantesIds = participantes?.map((participante: any) => participante.id);

        let where: WhereOptions = {
            [Op.and]: [
                {
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
                },
                // si un isiario de participantesIds  esta en participantesIds o si el lider es el lider
                {
                    [Op.or]: [
                        {'$propietario.id$': participantesIds },
                        {'$responsables.id$': participantesIds },
                    ]
                },

                showOnlyMe === "true" ? { 
                    [Op.or]: [
                        { '$propietario.id$': propietarioId },
                        { '$responsables.id$': propietarioId }
                    ]
                } : {}
            ],
            tipoObjetivo: 'CORE'   
        };

        
        const objetivosCore = await Tacticos.findAll({ 
            where,
            include: [
                {
                    model: Usuarios,
                    as: 'responsables',
                    attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'email', 'foto'],
                    through: {
                        attributes: []
                    },
                    required: false
                },
                {
                    model: Usuarios,
                    as: 'propietario',
                    attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'email', 'foto'],
                    required: false
                }
            ],
            }
        );

        
        res.json({ objetivosCore });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador',
            error
        });
        
    }

}

export const createTactico = async (req: Request, res: Response) => {    
    const { year, estrategicoId, slug } = req.body;
    const { id: propietarioId } = req.user as UsuarioInterface

    const fechaInicio = dayjs(`${year}-01-01`).startOf('year').toDate();
    const fechaFin = dayjs(`${year}-12-31`).endOf('year').toDate();

    const departamento = await Departamentos.findOne({ where: { [Op.or]: [{ id: slug }, { slug }] } })
        
    try {

       const usuario = await Usuarios.findOne({ where: { id: propietarioId } })

        let codigo = ''

        const objetivoTactico = await Tacticos.create({
            propietarioId,  
            estrategicoId,
            tipoObjetivo: estrategicoId ? 'ESTRATEGICO' : 'CORE',
            codigo,
            nombre: `Objetivo Tactico ${estrategicoId ? 'Estrategico' : 'Core'}`,
            fechaInicio,
            fechaFin,
            departamentoId: usuario?.departamentoId
        });        

        await updateCode({id: objetivoTactico.id})

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
    const { nombre, codigo, meta, indicador, status, progreso, responsables , propietarioId, estrategicoId, proyeccion, tipoProgreso} = req.body;

//  at 6am
    const fechaInicio = dayjs(proyeccion[0]).toDate()
    const fechaFin = dayjs(proyeccion[1]).toDate()    

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
            tipoProgreso,
            estrategicoId: estrategicoId ? estrategicoId : null, 
            status: statusFinal,
            progreso: progresoFinal,
            propietarioId,
            fechaInicio: fechaInicio,
            fechaFin: fechaFin
            
        });

        let promedio = 0

        await objetivoTactico.setResponsables(participantes);

        await objetivoTactico.reload({ include: includes });

        // Obtener el promedio de los resultados clave y asignarselo al progreso
        const objetivosOperativos = await ObjetivoOperativos.findAll({ where: { tacticoId: objetivoTactico.id } });

        let totalProgress = 0;
        let totalResultadosClave = 0;

        for (const objetivoOperativo of objetivosOperativos) {
            const resultadosClave = await ResultadosClave.findAll({
              where: { operativoId: objetivoOperativo.id }
            });
        
            // Accumulate progress and count the key results
            for (const resultadoClave of resultadosClave) {
              totalProgress += resultadoClave.progreso;
              totalResultadosClave++;
            }
          }

        promedio = totalResultadosClave > 0 ? Math.round(totalProgress / totalResultadosClave) : 0;

        objetivoTactico.setDataValue('suggest', promedio);

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
export const updateCode = async ({id}: {id:string}) => {

    const objetivoTactico = await Tacticos.findByPk(id);
    if(objetivoTactico.estrategicoId){
        const objetivoEstrategico = await objetivoTactico.getEstrategico()
        const objetivosOperativos = await objetivoEstrategico.getTacticos({
            paranoid: false,
        });
        const totalObjetivosOperativos = objetivosOperativos.length
        objetivoTactico.codigo = `${objetivoEstrategico.codigo}-OT-${totalObjetivosOperativos}`;
        await objetivoTactico.save();      
    }else{
        const usuario  = await Usuarios.findOne({where: {id: objetivoTactico.propietarioId}})
        const departamento = await Departamentos.findOne({ 
            where: {id: usuario?.departamentoId},
            include: [
                {
                    model: Areas,
                    as: 'area',
                    attributes: ['codigo'],
                }
            ]
        })

        const totalObjetivosOperativos = await Tacticos.count({
            where: {
                departamentoId: departamento?.id
            },
            paranoid: false
        });

        objetivoTactico.codigo = `${departamento?.area.codigo}-OTC-${totalObjetivosOperativos}`;
        await objetivoTactico.save();
    }

}

export const changeTypeTactico = async (req: Request, res: Response) => {

    const { tacticoId, type, estrategicoId } = req.body;

    try {

        const objetivoTactico = await Tacticos.findOne({ where: { id: tacticoId } });
        if (!objetivoTactico) return res.status(404).json({ msg: 'No se encontró el objetivo tactico' })


        if(type === 'ESTRATEGICO'){
            objetivoTactico.tipoObjetivo = 'ESTRATEGICO';
            objetivoTactico.estrategicoId = estrategicoId;
        }else{
            objetivoTactico.tipoObjetivo = 'CORE';
            objetivoTactico.estrategicoId = null;
        }


        await objetivoTactico.save();
        await objetivoTactico.reload({ include: includes });

        res.json({ objetivoTactico });

        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });        
    }

}

export const changeTypeProgress = async (req: Request, res: Response) => {

    const { tacticoId, type } = req.body;

    try {
        const objetivoTactico = await Tacticos.findOne({ where: { id: tacticoId } });
        if (!objetivoTactico) return res.status(404).json({ msg: 'No se encontró el objetivo tactico' })
        
        objetivoTactico.tipoProgreso = type
        
   
        let promedio = 0
        

        if(type === 'PROMEDIO'){

            // Obtener el promedio de los resultados clave y asignarselo al progreso
            const objetivosOperativos = await ObjetivoOperativos.findAll({ where: { tacticoId } });

            let totalProgress = 0;
            let totalResultadosClave = 0;

            for (const objetivoOperativo of objetivosOperativos) {
                const resultadosClave = await ResultadosClave.findAll({
                  where: { operativoId: objetivoOperativo.id }
                });
            
                // Accumulate progress and count the key results
                for (const resultadoClave of resultadosClave) {
                  totalProgress += resultadoClave.progreso;
                  totalResultadosClave++;
                }
              }

            promedio = totalResultadosClave > 0 ? Math.round(totalProgress / totalResultadosClave) : 0;

            objetivoTactico.progreso = promedio;         
        }        
        
        await objetivoTactico.save();
        await objetivoTactico.reload({ include: includes });

        objetivoTactico.setDataValue('suggest', promedio);   
  

        res.json({ objetivoTactico });

    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });        
    }

}

