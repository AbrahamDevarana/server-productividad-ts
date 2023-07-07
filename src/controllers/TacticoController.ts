import { Areas, Comentarios, Cuatrimestre, Departamentos, ObjetivoEstrategico, Perspectivas, Tacticos, Usuarios } from '../models'
import { Request, Response } from 'express'
import { Op } from 'sequelize'
import dayjs from 'dayjs'
import { UsuarioInterface } from '../interfaces'


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
        model: Cuatrimestre,
        as: 'cuatrimestres',
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


    try {

        const tacticosGeneral = await Tacticos.findAll({
            where,
            include: includes,
            // [{
            //     model: Usuarios,
            //     as: 'responsables',
            //     through: { attributes: [] },
            //     where: whereResponsable,
            // },{
            //     model: Areas,
            //     as: 'areas',
            //     through: { attributes: [] },
            //     where: whereArea,
            //     attributes: ['id', 'nombre']
            // },
            // {
            //     model: Usuarios,
            //     as: 'propietario',
            //     attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'iniciales', 'email', 'foto'],
            // }]
        });

        res.json({ tacticosGeneral });           

        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }

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

    const fechaInicio = dayjs(`${year}-01-01`).format('YYYY-MM-DD') + ' 00:01:00';
    const fechaFin = dayjs(`${year}-12-31`).format('YYYY-MM-DD') + ' 23:59:00';

    try {

        let estrategicoId = null;
        const area = await Areas.findOne({ 
            where: {slug}, 
            include: { 
                model: Perspectivas, 
                as: 'perspectivas', 
                attributes: ['id', 'nombre'],
                include: [{
                    model: ObjetivoEstrategico,
                    as: 'objetivos_estrategicos',
                    attributes: ['id']
                }]
            }});

        if(estrategico){
            estrategicoId = (area?.perspectivas.objetivos_estrategicos[0].id);
        }
            
        const objetivoTactico = await Tacticos.create({
            propietarioId,
            estrategicoId,
            nombre: 'Nuevo Objetivo Tactico',
            fechaInicio,
            fechaFin,
        });        

        await objetivoTactico.setAreas([area?.id]);

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

// export const createTactico = async (req: Request, res: Response) => {
//     const { nombre, codigo, meta, indicador, fechaInicio, fechaFin, responsablesArray = [], areasArray = [], estrategicoId = null, propietarioId } = req.body;

//     try {
//         const trimestres = Math.ceil(dayjs(fechaFin).diff(fechaInicio, 'month', true) / 3);        

//         let arrayTactico = []
//         for (let i = 0; i < trimestres+1; i++) {
//             const fechaInicioTrimestre = dayjs(fechaInicio).add(i*3, 'month').format('YYYY-MM-DD') + ' 00:01:00';
//             const fechaFinTrimestre = i < trimestres - 1 ? dayjs(fechaInicio).add((i+1)*3, 'month').subtract(1, 'day').format('YYYY-MM-DD') : fechaFin;
            

//             const objetivoTactico = await Tacticos.create({ 
//                 nombre, 
//                 codigo, 
//                 meta, 
//                 indicador, 
//                 fechaInicio: fechaInicioTrimestre,
//                 fechaFin: fechaFinTrimestre,
//                 propietarioId, 
//                 estrategicoId: estrategicoId ? estrategicoId : null,
//                 trimestres: i+1,
//             });
            
//             await objetivoTactico.setResponsables(responsablesArray);
//             await objetivoTactico.setAreas(areasArray);
//             await objetivoTactico.reload({ include: includes });
            
//             arrayTactico.push(objetivoTactico);
                
//             if ( i > 0 ) {
//                 await Tacticos.update({ objetivoPadre: arrayTactico[0].id }, { where: { id: arrayTactico[i].id } });
//             }
//         }

//         res.json({
//             objetivoTactico: arrayTactico[0]
//         });
        
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({
//             msg: 'Hable con el administrador'
//         });
//     }
// }

export const updateTactico = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { nombre, codigo, meta, indicador, status, progreso, responsablesArray = [], propietarioId, estrategicoId} = req.body;

    const participantes = [...responsablesArray, propietarioId]
    
    let progresoFinal = progreso;
    let statusFinal = status;



    
    try {
        
        let areasSet: Set<number> = new Set();
        await Promise.all(participantes.map(async (responsable: any) => {
            const usuario = await Usuarios.findByPk(responsable, {
                include: [{
                model: Departamentos,
                as: 'departamento',
                attributes: ['id', 'nombre'],
                include: [{
                    model: Areas,
                    as: 'area',
                    attributes: ['id', 'nombre']
                }]
                }]
            });
            if (usuario?.departamento?.area?.id) {
                areasSet.add(usuario?.departamento?.area?.id);
            }
        }));        
        
        const objetivoTactico = await Tacticos.findByPk(id);

        if(status !== objetivoTactico.status){
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
                if(objetivoTactico.progreso === 100){
                    progresoFinal = 99;
                } else if (objetivoTactico.progreso === 0){
                    progresoFinal = 1;
                }
            }
        }

        if(progreso !== objetivoTactico.progreso){

            if(progreso === 100){
                statusFinal = 'FINALIZADO';
            }else if (progreso === 0){
                statusFinal = 'SIN_INICIAR';
            }else if (progreso > 0 && progreso < 100){
                statusFinal = 'EN_TIEMPO';
            }
        }

        if (objetivoTactico) {
            await objetivoTactico.update({ 
                nombre, 
                codigo, 
                meta, 
                indicador,
                estrategicoId: estrategicoId ? estrategicoId : null, 
                status: statusFinal,
                progreso: progresoFinal,
                propietarioId 
            });


            await objetivoTactico.setResponsables(responsablesArray);
            
            if(areasSet.size > 0){
                await objetivoTactico.setAreas([...areasSet]);
            }


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
                    model: Cuatrimestre,
                    as: 'cuatrimestres',
                }
            ]

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



const getQuarterDates = (year:number, quarter:number) => {
    const startQuarter = (quarter - 1) * 3 + 1;
    const startDate = dayjs(`${year}-${startQuarter}-01`).startOf('month');
    const endDate = startDate.add(2, 'month').endOf('month');
    return { startDate, endDate };
  }
  
