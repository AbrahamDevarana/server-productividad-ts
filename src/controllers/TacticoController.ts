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

export const getTacticos = async (req: Request, res: Response) => {
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

export const createTactico = async (req: Request, res: Response) => {    
    const { slug, year, estrategicoId, departamentoId} = req.body;
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
            departamentoId
        });        

        await updateCode({id: objetivoTactico.id, slug})

        await objetivoTactico.reload({
            include: includes
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
    const { nombre, codigo, meta, indicador, status, progreso, responsables , propietarioId, estrategicoId, departamentoId, proyeccion} = req.body;


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
            propietarioId ,
            departamentoId,
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

// export const getTacticosByEquipos = async (req: Request, res: Response) => {


//     const { year, search, status, slug } = req.query;
//     const fechaInicio = dayjs(`${year}-01-01`).startOf('year').toDate();
//     const fechaFin = dayjs(`${year}-12-31`).endOf('year').toDate();
    
//     let where = {};

//     where = {
//         ...where,
//         [Op.or]: [
//             {
//                 fechaInicio: {
//                     [Op.between]: [fechaInicio, fechaFin]
//                 }
//             },
//             {
//                 fechaFin: {
//                     [Op.between]: [fechaInicio, fechaFin]
//                 }
//             }
//         ],   
//     }

//     const includes = [
//         {
//             model: Usuarios,
//             as: 'responsables',
//             attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'email', 'foto'],
//             through: {
//                 attributes: []
//             },
//             include: [
//                 {
//                     model: Departamentos,
//                     as: 'departamento',
//                     attributes: ['id', 'nombre', 'slug'],
//                 }
//             ]
//         },
//         {
//             model: Usuarios,
//             as: 'propietario',
//             attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'email', 'foto'],
//             include: [
//                 {
//                     model: Departamentos,
//                     as: 'departamento',
//                     attributes: ['id', 'nombre', 'slug'],
//                 }
//             ]
//         },
//         {
//             model: ObjetivoEstrategico,
//             as: 'estrategico',
//             include: [{
//                 model: Perspectivas,
//                 as: 'perspectivas',
//                 attributes: ['id', 'nombre',  'color']
//             }]
//         }
//     ]

//    try {
//         const tacticos = await Tacticos.findAll({
//             include: includes,
//             where: {
//                 ...where,
//                 [Op.not]: { estrategicoId: null }
//             },
//         });

//         res.json({ objetivosTacticos: { tacticos} });

    
//    } catch (error) {
//          console.log(error);
//          res.status(500).json({
//               msg: 'Hable con el administrador'
//          });
//    }

// }

// export const getTacticosByObjetivoEstrategico = async (req: Request, res: Response) => {
    
//     const { estrategicoId } = req.params;
//     const { year, quarter, search, slug } = req.query;

    
//     let where = {};

//     const includes = [
//         {
//             model: Usuarios,
//             as: 'responsables',
//             attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'email', 'foto'],
//             through: {
//                 attributes: []
//             },
//             include: [
//                 {
//                     model: Departamentos,
//                     as: 'departamento',
//                     attributes: ['id', 'nombre', 'slug'],
//                 }
//             ]
//         },
//         {
//             model: Usuarios,
//             as: 'propietario',
//             attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'email', 'foto'],
//             include: [
//                 {
//                     model: Departamentos,
//                     as: 'departamento',
//                     attributes: ['id', 'nombre', 'slug'],
//                 }
//             ]
//         },
//         {
//             model: ObjetivoEstrategico,
//             as: 'estrategico',
//             include: [{
//                 model: Perspectivas,
//                 as: 'perspectivas',
//                 attributes: ['id', 'nombre',  'color']
//             }]
//         },
//     ]
    
//     if(search){        
//         where = {
//             ...where,
//             [Op.and]: [
//                {
//                      [Op.or]: [ 
//                         {
//                             nombre: {
//                                 [Op.like]: `%${search}%`
//                             }
//                         },
//                         {
//                             codigo: {
//                                 [Op.like]: `%${search}%`
//                             }
//                         }
//                     ]
//                }
//             ]
//         } 
//     }


//         where = {
//             ...where,
//             estrategicoId: null
//         }

//     try {

//         let objetivosTacticos = []
        
//         objetivosTacticos = await Tacticos.findAll({
//             include: includes,
//             where: where
//         });
        
//         res.json({ objetivosTacticos });

//     } catch (error) {
//         console.log(error);
//         res.status(500).json({
//             msg: 'Hable con el administrador'
//         });   
//     }
// }

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
