import { Areas, Comentarios, Trimestre, Departamentos, ObjetivoEstrategico, Perspectivas, Tacticos, Usuarios } from '../models'
import e, { Request, Response } from 'express'
import { Op } from 'sequelize'
import dayjs from 'dayjs'
import { UsuarioInterface } from '../interfaces'
import { getStatusAndProgress } from '../helpers/getStatusAndProgress'


const includes = [
    {
        model: Areas,
        as: 'areas',
        through: { attributes: [] },
        attributes: ['id', 'nombre']
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
                attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'iniciales', 'foto'],
            }
        ]
    },
    {
        model: Trimestre,
        as: 'trimestres',
        through: {
            attributes: ['activo']
        },
    }
]

export const getTacticos = async (req: Request, res: Response) => {
    const {nombre, codigo, fechaInicio, fechaFin, tipoObjetivo, status, order} = req.query;
    const where: any = {};
    const whereResponsable: any = {};
    const whereArea: any = {};

    nombre && (where.nombre = { [Op.like]: `%${nombre}%` });
    codigo && (where.codigo = { [Op.like]: `%${codigo}%` });
    fechaInicio && (where.fechaInicio = { [Op.gte]: fechaInicio });
    fechaFin && (where.fechaFin = { [Op.lte]: fechaFin });
    tipoObjetivo && (where.tipoObjetivo = tipoObjetivo);
    status && (where.status = status);


    // try {

    //     const tacticosGeneral = await Tacticos.findAll({
    //         where,
    //         include: includes,
    //         // [{
    //         //     model: Usuarios,
    //         //     as: 'responsables',
    //         //     through: { attributes: [] },
    //         //     where: whereResponsable,
    //         // },{
    //         //     model: Areas,
    //         //     as: 'areas',
    //         //     through: { attributes: [] },
    //         //     where: whereArea,
    //         //     attributes: ['id', 'nombre']
    //         // },
    //         // {
    //         //     model: Usuarios,
    //         //     as: 'propietario',
    //         //     attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'iniciales', 'email', 'foto'],
    //         // }]
    //     });

    //     res.json({ tacticosGeneral });           

        
    // } catch (error) {
    //     console.log(error);
    //     res.status(500).json({
    //         msg: 'Hable con el administrador'
    //     });
    // }

}

export const getTactico = async (req: Request, res: Response) => {
    const { id } = req.params;    
    try {
        const objetivoTactico = await Tacticos.findByPk(id, { include: includes });
        if (objetivoTactico) {

            res.json({
                objetivoTactico
            });
        } else {
            res.status(404).json({
                msg: `No existe un objetivo tactico con el id ${id}`
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const createTactico = async (req: Request, res: Response) => {
    const { slug, year, estrategico = false} = req.body;
    const {id: propietarioId} = req.user as UsuarioInterface

    const fechaInicio = dayjs(`${year}-01-01`).startOf('year').toDate();
    const fechaFin = dayjs(`${year}-12-31`).endOf('year').toDate();

    try {        

        let estrategicoId = null;

        let codigo = ''
        const area = await Areas.findOne({ 
            where: {slug}, 
            include: { 
                model: Perspectivas, 
                as: 'perspectivas', 
                attributes: ['id', 'nombre'],
                include: [{
                    model: ObjetivoEstrategico,
                    as: 'objetivosEstrategicos',
                    attributes: ['id', 'nombre'],
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
                }]
        }});
            
        if(estrategico){
            estrategicoId = (area?.perspectivas.objetivosEstrategicos[0].id);
        }else {
            codigo = area?.codigo
        }

        const objetivoTactico = await Tacticos.create({
            propietarioId,
            estrategicoId,
            codigo,
            nombre: 'Nuevo Objetivo Tactico',
            fechaInicio,
            fechaFin,
        });        

        await objetivoTactico.setAreas([area?.id]);

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
    const { nombre, codigo, meta, indicador, status, progreso, responsablesArray = [], propietarioId, estrategicoId, year, slug} = req.body;

    let participantes = [...responsablesArray, propietarioId]

    try {
        
        const area = await Areas.findOne({ 
            where: {slug}, 
            include: { 
                model: Perspectivas, 
                as: 'perspectivas', 
                attributes: ['id', 'nombre'],
                include: [{
                    model: ObjetivoEstrategico,
                    as: 'objetivosEstrategicos',
                    attributes: ['id']
                }]
        }});

        let areaArray: any[] = []
        let areasSet: Set<number> = new Set();
        let codigoFinal = codigo;

        await Promise.all(participantes.map(async (responsable: any) => {
            const usuario = await Usuarios.findByPk(responsable, {
                include: [{
                    model: Departamentos,
                    as: 'departamentos',
                    attributes: ['id', 'nombre'],
                    include: [{
                        model: Areas,
                        as: 'area',
                        attributes: ['id', 'nombre']
                    }]
                }],
                attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'iniciales', 'email', 'foto']
            });            
            
            if (usuario && usuario.departamentos.length > 0) {
                
                usuario.departamentos.forEach((departamento: any) => {
                    areaArray.push(departamento.area.id);
                });
                
            }
          
            areasSet = new Set(areaArray);
            areasSet.add(area?.id);
        }));        
        
        const objetivoTactico = await Tacticos.findByPk(id);

        const { progresoFinal, statusFinal } = getStatusAndProgress({progreso, status, objetivo: objetivoTactico});

        if (objetivoTactico) {
            await objetivoTactico.update({ 
                nombre, 
                codigo: codigoFinal,
                meta, 
                indicador,
                estrategicoId: estrategicoId ? estrategicoId : null, 
                status: statusFinal,
                progreso: progresoFinal,
                propietarioId 
            });

            await updateCode({id: objetivoTactico.id, slug})


            await objetivoTactico.setResponsables(responsablesArray);
            
            if(areasSet.size > 0){
                await objetivoTactico.setAreas([...areasSet]);
            }

            await objetivoTactico.reload({ include: includes });

            res.json({
                objetivoTactico
            });


        } else {
            res.status(404).json({
                msg: `No existe un objetivo tactico con el id ${id}`
            });
        }
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
                msg: `No existe un objetivo tactico con el id ${id}`
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const getTacticosByArea = async (req: Request, res: Response) => {
    const { slug } = req.params;
    const { year } = req.query;
    
    
    let where = {
        [Op.or]: [
            {
                fechaInicio: {
                    [Op.between]: [`${year}-01-01 00:00:00`, `${year}-12-31 23:59:59`]
                }
            },
            {
                fechaFin: {
                    [Op.between]: [`${year}-01-01 00:00:00`, `${year}-12-31 23:59:59`]
                }
            }
        ]
        
        
        
    };
 

    const includes = [
        {
            model: Areas,
            as: 'areas',
            through: { attributes: [] },
            attributes: ['id', 'nombre'],
            where: {
                slug
            }
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
                    attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'iniciales', 'foto'],
                }
            ]
        },
        {
            model: Trimestre,
            as: 'trimestres',
            through: { attributes: ['activo'] },
        }
    ]

    
    try {
        const tacticos = await Tacticos.findAll({
            include: includes,
            where: {
                ...where,
                [Op.not]: { estrategicoId: null }
            },
        });

        const tacticos_core = await Tacticos.findAll({
            include: includes,
            where: {
                ...where,
                estrategicoId: null
            },
        });

                
        res.json({ objetivosTacticos: { tacticos, tacticos_core } });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const getTacticosByEstrategia = async (req: Request, res: Response) => {
    const { estrategiaId } = req.params;
    
    try {
        const tacticos = await Tacticos.findAll({
            include: [
                {
                    model: ObjetivoEstrategico,
                    as: 'estrategico',
                    where: { id: estrategiaId }
                },
                {
                    model: Usuarios,
                    as: 'responsables',
                    through: { attributes: [] },
                },
                {
                    model: Areas,
                    as: 'areas',
                    through: { attributes: [] },
                },
                {
                    model: Usuarios,
                    as: 'propietario',
                    attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'email', 'iniciales', 'foto'],
                }
            ]
        });
        res.json({ tacticos });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const getTacticosByEquipos = async (req: Request, res: Response) => {
    const { slug } = req.params;
    const { year, departamentoId } = req.query;


    let where = {
        [Op.or]: [
            {
                fechaInicio: {
                    [Op.between]: [`${year}-01-01 00:00:00`, `${year}-12-31 23:59:59`]
                }
            },
            {
                fechaFin: {
                    [Op.between]: [`${year}-01-01 00:00:00`, `${year}-12-31 23:59:59`]
                }
            }
        ],
    }

    const include = [
        {
            model: Areas,
            as: 'area',
            where: {
                slug
            },
            include: [
                {
                    model: Tacticos,
                    as: 'tacticos',
                    include: [
                        {
                            model: Usuarios,
                            as: 'responsables',
                            through: { attributes: [] },
                        },
                        {
                            model: Usuarios,
                            as: 'propietario',
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
                                    attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'iniciales', 'foto'],
                                }   
                            ]
                        },
                        {
                            model: Trimestre,
                            as: 'trimestres',
                            through: { attributes: ['activo'] },
                        }
                    ],
                    
                }
            ]
        }
    ]

   try {
        const tacticos_core = await Departamentos.findAll({
            include: include,
            where: {
                id: departamentoId,
                '$area.tacticos.estrategicoId$': null,
            }
        });

        const tacticos = await Departamentos.findAll({
            include: include,
            where: {
                id: departamentoId,
                '$area.tacticos.estrategicoId$': {
                    [Op.not]: null
                }
            }
        });

        res.json({ objetivosTacticos: {tacticos_core, tacticos} });

    
   } catch (error) {
         console.log(error);
         res.status(500).json({
              msg: 'Hable con el administrador'
         });
   }

}




// Custom Controller
export const updateQuarters = async (req: Request, res: Response) => {

    const { id } = req.params;
    const {trimestresActivos = [], year} = req.body;

    try {

    const objetivoTactico = await Tacticos.findByPk(id);
    const trimestres = await Trimestre.findAll({ where: { year } });

    for (let trimestre of trimestres) {
        await objetivoTactico.addTrimestre(trimestre, { through: { activo: false } });
    }

    for (let trimestreActivo of trimestresActivos) {
        // @ts-ignore
        const trimestre = trimestres.find(t => t.trimestre === trimestreActivo);
        if (!trimestre) {
            throw new Error(`No se encontró Trimestre con trimestre ${trimestreActivo} para el año ${year}`);
        }
        await objetivoTactico.addTrimestre(trimestre, { through: { activo: true } });
    }
    
    await objetivoTactico.reload({
        include: [
            {
                model: Trimestre,
                as: 'trimestres',
                through: { attributes: ['activo'] },
            }
        ]
    });

    res.json({ objetivoTactico });
    

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

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