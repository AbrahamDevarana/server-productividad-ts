import { Areas, Comentarios, Trimestre, Departamentos, ObjetivoEstrategico, Perspectivas, Tacticos, Usuarios } from '../models'
import { Request, Response } from 'express'
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
                attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'iniciales', 'email', 'foto', 'slug'],
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

export const getTacticos = async (req: Request, res: Response) => {
    const { year } = req.query;
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
        ]
    };


    try {

            const tacticosGeneral = await Tacticos.findAll({
                include: [
                    {
                        model: ObjetivoEstrategico,
                        as: 'estrategico',
                        include: [{
                            model: Perspectivas,
                            as: 'perspectivas',
                            attributes: ['id', 'nombre',  'color']
                        }],
                    }
                ],
                where,
            });
            

            res.json({ tacticosGeneral });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador',
            error
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
            where: { slug },
            include: [
            {
                model: Perspectivas,
                as: 'perspectivas',
                attributes: ['id'],
                include: [{
                    model: ObjetivoEstrategico,
                    as: 'objetivosEstrategicos',
                    attributes: ['id'],
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
            }]
        });

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

    const participantes = [...responsablesArray, propietarioId]

    try {

        const areaArray: any[] = []
        let areasSet: Set<number> = new Set();
        const codigoFinal = codigo;

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
                }],
                attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'iniciales', 'email', 'foto']
            });            
            
            if (usuario && usuario.departamento) {
                areaArray.push(usuario.departamento.area.id);
            }
          
            areasSet = new Set(areaArray);
            // areasSet.add(area?.id);
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

            // await updateCode({id: objetivoTactico.id, slug})


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


// throw new Error('Not implemented yet');
export const getTacticosByArea = async (req: Request, res: Response) => {
    const { slug } = req.params;
    const { year, search, periodos, status } = req.query;

    let where = {};
    let wherePeriodo = {};

    if (status) {

        where = {
            ...where,
            [Op.and]: [
                {
                    status: {
                        [Op.in]: status
                    }
                }   
            ]
        }
    }

    if(search){        
        where = {
            ...where,
            [Op.and]: [
               {
                     [Op.or]: [ 
                        {
                            nombre: {
                                [Op.like]: `%${search}%`
                            }
                        },
                        {
                            codigo: {
                                [Op.like]: `%${search}%`
                            }
                        }
                    ]
               }
            ]
        }        
    }
    

    if(periodos){
        wherePeriodo = {
            ...wherePeriodo,
            [Op.and]: [
                {
                    '$trimestres->pivot_tactico_trimestre.activo$': true,
                },
                {
                    trimestre: {
                        [Op.in]: periodos
                    }
                }
            ]
        }
    }

    where = {
        ...where,
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
            model: Trimestre,
            as: 'trimestres',
            through: { attributes: ['activo'] },
            // where: wherePeriodo,
        }
    ]

    
    try {
        const tacticos = await Tacticos.findAll({
            include: includes,
            where: {
                ...where,
                [Op.not]: { estrategicoId: null },
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

///  No se usa
export const getTacticosByEstrategia = async (req: Request, res: Response) => {

    throw new Error('Not implemented yet');
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


    const { year, search, periodos, status, slug } = req.query;
    const fechaInicio = dayjs(`${year}-01-01`).startOf('year').toDate();
    const fechaFin = dayjs(`${year}-12-31`).endOf('year').toDate();
    
    let where = {};
    let wherePeriodo = {};

    if (status) {

        where = {
            ...where,
            [Op.and]: [
                {
                    status: {
                        [Op.in]: status
                    }
                }   
            ]
        }
    }

    if(search){        
        where = {
            ...where,
            [Op.and]: [
               {
                     [Op.or]: [ 
                        {
                            nombre: {
                                [Op.like]: `%${search}%`
                            }
                        },
                        {
                            codigo: {
                                [Op.like]: `%${search}%`
                            }
                        }
                    ]
               }
            ]
        }        
    }
    

    if(periodos){
        wherePeriodo = {
            ...wherePeriodo,
            [Op.and]: [
                {
                    '$trimestres->pivot_tactico_trimestre.activo$': true,
                },
                {
                    trimestre: {
                        [Op.in]: periodos
                    }
                }
            ]
        }
    }

    where = {
        ...where,
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
    }

    const includes = [
        {
            model: Usuarios,
            as: 'responsables',
            attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'email', 'foto'],
            through: {
                attributes: []
            },
            include: [
                {
                    model: Departamentos,
                    as: 'departamento',
                    attributes: ['id', 'nombre', 'slug'],
                }
            ]
        },
        {
            model: Usuarios,
            as: 'propietario',
            attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'email', 'foto'],
            include: [
                {
                    model: Departamentos,
                    as: 'departamento',
                    attributes: ['id', 'nombre', 'slug'],
                }
            ]
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

        const tacticosFiltered = filtrarTacticos(tacticos, slug as string)
        

        const tacticos_core = await Tacticos.findAll({
            include: includes,
            where: {
                ...where,
                estrategicoId: null
            },
        });
        

        const tacticosCoreFiltered = filtrarTacticos(tacticos_core, slug as string)

        res.json({ objetivosTacticos: {tacticos_core: tacticosCoreFiltered, tacticos: tacticosFiltered} });

    
   } catch (error) {
         console.log(error);
         res.status(500).json({
              msg: 'Hable con el administrador'
         });
   }

}

export const getTacticosByObjetivoEstrategico = async (req: Request, res: Response) => {
    
    const { estrategicoId } = req.params;
    const { year, quarter, search, slug } = req.query;

    
    let where = {};

    const includes = [
        {
            model: Usuarios,
            as: 'responsables',
            attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'email', 'foto'],
            through: {
                attributes: []
            },
            include: [
                {
                    model: Departamentos,
                    as: 'departamento',
                    attributes: ['id', 'nombre', 'slug'],
                }
            ]
        },
        {
            model: Usuarios,
            as: 'propietario',
            attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'email', 'foto'],
            include: [
                {
                    model: Departamentos,
                    as: 'departamento',
                    attributes: ['id', 'nombre', 'slug'],
                }
            ]
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
            model: Trimestre,
            as: 'trimestres',
            through: { attributes: ['activo'] },
        }
    ]
    
    if(search){        
        where = {
            ...where,
            [Op.and]: [
               {
                     [Op.or]: [ 
                        {
                            nombre: {
                                [Op.like]: `%${search}%`
                            }
                        },
                        {
                            codigo: {
                                [Op.like]: `%${search}%`
                            }
                        }
                    ]
               }
            ]
        } 
    }


    if(estrategicoId !== 'undefined'){
        where = {
            ...where,
            estrategicoId
        }
    }else {
        where = {
            ...where,
            estrategicoId: null
        }
    }

    try {

        const area = await Areas.findOne({
            where: {
                slug
            }
        });


        // console.log('Área', area);

        let objetivosTacticos = []
        
            
        if(estrategicoId === 'undefined'){
            objetivosTacticos = await area.getTacticos({
                include: includes,
                where: where
            });
        }else {
            objetivosTacticos = await Tacticos.findAll({
                include: includes,
                where: where
            });
        }


        res.json({ objetivosTacticos });

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



const filtrarTacticos = (tacticos: any[], slug: string) => {    
    // Filtra los 'Tacticos' en base al 'slug' del 'Area' al que pertenecen sus 'Usuarios'
    const filteredTacticos = tacticos.filter(tactico => {
        
        // Chequea si el 'propietario' pertenece al 'Area' con el 'slug' dado
        const isPropietarioInArea = tactico.propietario.departamento?.slug === slug;

        // Chequea si alguno de los 'responsables' pertenece al 'Area' con el 'slug' dado
        const isAnyResponsableInArea = tactico.responsables.some((responsable : any ) => {
            return responsable.departamento?.slug === slug;
        });
        
        // Retorna 'true' si el 'propietario' o algún 'responsable' pertenece al 'Area' con el 'slug' dado
        return isPropietarioInArea || isAnyResponsableInArea;
    })


    return filteredTacticos;
}
