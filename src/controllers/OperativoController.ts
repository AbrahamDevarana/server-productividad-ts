import { Request, Response } from "express";
import { ObjetivoOperativos, Usuarios, ResultadosClave, PivotOpUsuario, Task, Rendimiento } from "../models";
import dayjs from "dayjs";
import { Op } from "sequelize";
import { updateRendimiento } from "../helpers/updateRendimiento";
import { updateProgresoObjetivo } from "./ResultadosController";


const includes = [
    {
        model: Usuarios,
        as: 'operativosResponsable',
        attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'iniciales', 'email', 'foto', 'slug', 'leaderId'],
        through: {
            attributes: ['propietario', 'progresoAsignado', 'progresoReal', 'extra', 'status'],
            as: 'scoreCard'
        },
        required: false
    },
    {
        model: ResultadosClave,
        as: 'resultadosClave',
        attributes: ['id', 'nombre', 'progreso', 'tipoProgreso', 'fechaInicio', 'fechaFin', 'operativoId', 'status', 'color'],
        required: false,
        include: [{
            model: Task,
            as: 'task',
            required: false,
            attributes: ['id', 'nombre', 'status', 'taskeableId', 'taskeableType', 'propietarioId', 'prioridad'],
            include: [ {
                model: Usuarios,
                as: 'propietario',
                attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'iniciales', 'email', 'foto', 'slug', 'leaderId'],
            }
        ]
        },
        {
            model: Usuarios,
            as: 'propietario',
            attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'iniciales', 'email', 'foto', 'slug', 'leaderId'],
        }
    ]
    }
]


export const getOperativos = async (req:any, res: Response) => {
    
    const { year, quarter, usuarioId } = req.query;
    try {
        const operativos = await ObjetivoOperativos.findAll({
            order: [['createdAt', 'ASC']],
            include: includes,
            where: {
                [Op.and]: [
                    {
                        year
                    },
                    {
                        quarter
                    },
                ]
            }
        });
      
        const filteredObjetivos = filtrarObjetivosUsuario(operativos, usuarioId)
        res.json({ operativos: filteredObjetivos });
    
    } catch (error) {
        console.log(error);
        
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const updateOperativo = async (req: Request, res: Response) => {
    const { id } = req.params;

    const { nombre, meta, indicador, fechaInicio, fechaFin, operativosResponsable = [] , tacticoId, propietarioId, year, quarter } = req.body;
    
    
    const fechaInicial = dayjs(fechaInicio).toDate();
    const fechaFinal = dayjs(fechaFin).toDate();

    try {
        const operativo = await ObjetivoOperativos.findByPk(id);
        if (!operativo) {
            return res.status(404).json({
                msg: `No existe un operativo`
            });
        }

        if (operativo.status === 'CERRADO') {
            return res.status(400).json({
                msg: `No se puede actualizar un objetivo cerrado`
            });
        }

        await operativo.update({
            nombre,
            meta,
            indicador,
            fechaInicio: fechaInicial,
            fechaFin: fechaFinal,
            // tacticoId,
        });


        const setResponsables = new Set();

        // si propietarioId es arrray tomar el primer valor

        operativosResponsable.forEach( (responsable: string) => {
            setResponsables.add(responsable);
        });
        
        setResponsables.add( propietarioId );
        
        await operativo.setOperativosResponsable(Array.from(setResponsables));

        const responsablesLista = await PivotOpUsuario.findAll({
            where: {
                objetivoOperativoId: operativo.id
            }
        });

        for (const responsable of responsablesLista) {
            const propietarioValue = responsable.usuarioId === propietarioId;
        
            await responsable.update({
                propietario: propietarioValue,
            });
        }


        await updateProgresoObjetivo({objetivoOperativoId: operativo.id});
        
        await operativo.reload( { include: includes } );

        res.json({operativo});
    
    } catch (error) {
        console.log(error);
        
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const createOperativo = async (req: Request, res: Response) => {
    
    const { nombre, meta, indicador, fechaInicio, fechaFin, operativosResponsable = [], tacticoId, quarter, year, propietarioId} = req.body;

    const fechaInicial = dayjs(fechaInicio).toDate();
    const fechaFinal = dayjs(fechaFin).toDate();

    try {

        const operativo = await ObjetivoOperativos.create({
            nombre,
            meta,
            indicador,
            fechaInicio: fechaInicial,
            fechaFin: fechaFinal,
            // tacticoId,
            quarter,
            year
        });

        if(!operativo) return res.status(400).json({ msg: 'No se pudo crear el operativo' });
    
        const setResponsables = new Set();
        
        operativosResponsable.forEach( (responsable: string) => {
            setResponsables.add(responsable);
        });

        setResponsables.add(propietarioId);

    
        await operativo.setOperativosResponsable(Array.from(setResponsables));
        
        const responsablesLista = await PivotOpUsuario.findAll({
            where: {
                objetivoOperativoId: operativo.id
            }
        });

        for (const responsable of responsablesLista) {
            const propietarioValue = responsable.usuarioId === propietarioId;
        
            await responsable.update({
                propietario: propietarioValue,
            });
        }
    
        // Crear resultado clave con 3 tasks

       if(operativo.id){

            const { year, quarter } = operativo;

            const firstDay = dayjs().year(year).quarter(quarter).startOf('quarter').toDate();
            const lastDay = dayjs().year(year).quarter(quarter).endOf('quarter').subtract(1, 'day').toDate();
            const resultadoClave = await ResultadosClave.create({
                nombre: operativo.nombre,
                fechaInicio: firstDay,
                fechaFin: lastDay,
                operativoId: operativo.id,
                status: 'SIN_INICIAR',
                tipoProgreso: 'acciones',
                progreso: 0,
                propietarioId: propietarioId,
                color: 'rgba(101, 106, 118, 1)'
            })

            if(!resultadoClave) return res.status(400).json({ msg: 'No se pudo crear el resultado clave' });

            await resultadoClave.reload();

            const nombres = ['Acción 1', 'Acción 2'];
            
            if(resultadoClave.id){
                for (const nombre of nombres) {
                    await Task.create({
                        nombre,
                        propietarioId,
                        taskeableId: resultadoClave.id,
                        taskeableType: 'RESULTADO_CLAVE',
                        prioridad: 'Normal',
                        status: 'SIN_INICIAR',
                        progreso: 0,
                        fechaFin: resultadoClave.fechaFin,
                    })   

                }
            }

        }

        await operativo.reload( { include: includes });

        res.json({operativo});
    
    } catch (error) {
        console.log(error);
        
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const deleteOperativo = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const operativo = await ObjetivoOperativos.findByPk(id);
        if (!operativo) {
            return res.status(404).json({
                msg: `No existe un operativo con el id ${id}`
            });
        }

        await operativo.destroy();

        res.json(operativo);
    
    } catch (error) {
        console.log(error);
        
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const getOperativo = async (req: Request, res: Response) => {

    
    const { id } = req.params;

    try {
        const operativo = await ObjetivoOperativos.findByPk(id, {
            include: includes
        });
        if (!operativo) {
            return res.status(404).json({
                msg: `No existe un operativo con el id ${id}`
            });
        }

        res.json({operativo});
    
    } catch (error) {
        console.log(error);
        
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

const filtrarObjetivosUsuario = (objetivos: any[], id: string) => {
    // id or slug
    const objetivoId = objetivos.filter( (obj: any) => obj.operativosResponsable.some( (res: any) => res.id === id));
    if(objetivoId.length > 0) return objetivoId;
    
    const objetivoSlug = objetivos.filter( (obj: any) => obj.operativosResponsable.some( (res: any) => res.slug === id));
    return objetivoSlug;
}

export const setPonderaciones = async (req: Request, res: Response) => {
    const {id} = req.params;
    const { ponderaciones} = req.body;

    try {



        ponderaciones.forEach( async (ponderacion: any) => {
                const { objetivoId, progresoAsignado } = ponderacion;

                const pivot = await PivotOpUsuario.findOne({
                    where: {
                        usuarioId: id,
                        objetivoOperativoId: objetivoId
                    }
                });

                if (pivot) {
                    await pivot.update({
                        progresoAsignado
                    });
                }
        });

        return res.json({
            ok: true,
            ponderaciones,
            usuarioId: id
        })
        
    } catch (error) {
        console.log(error);

        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });
        
    }
}

export const cierreCiclo = async (req: Request, res: Response) => {

    const { usuarioId, year, quarter, objetivosId } = req.body;
    try {

        const objetivos = await ObjetivoOperativos.findAll({
            where: {
                year,
                quarter,
                id: objetivosId
            }
        });

        const objetivoIds = objetivos.map( (obj: any) => obj.id );

        const pivot = await PivotOpUsuario.findAll({
            where: {
                usuarioId,
                objetivoOperativoId: objetivoIds
            }
        });

        for (const pivotItem of pivot) {
            await pivotItem.update({
                status: 'CERRADO'
            });
        }

        for (const objetivo of objetivos) {
            await objetivo.update({
                status: 'CERRADO'
            });
        }

    
        await updateRendimiento({ usuarioId, year, quarter });
    
        const rendimiento = await Rendimiento.findOne({
            where: {
                usuarioId,
                year,
                quarter
            }
        });
    
        if(rendimiento){
            await rendimiento.update({
                status: 'CERRADO'
            });
        }
    
    
        res.json({
            ok: true,
            msg: 'Ciclo cerrado',
            rendimiento,
            objetivos,
            pivot
        })
        
    } catch (error) {

        console.log(error);

        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });
        
    }
}

// Renombrar
export const cerrarObjetivo = async (req: Request, res: Response) => {

    const { operativoId, checked } = req.body;


    try {
        const objetivo = await ObjetivoOperativos.findByPk(operativoId);

        if(!objetivo) return res.status(404).json({ msg: 'No existe un este objetivo' });
        if(objetivo.status === 'CERRADO') return res.status(400).json({ msg: 'Este objetivo ya esta cerrado' });




        if(checked){
            if(objetivo.status === 'NUEVO') {
                await objetivo.update({
                    status: 'POR_AUTORIZAR'
                });
            }else{
                await objetivo.update({
                    status: 'POR_APROBAR'
                });
            }          
        }else{

            if(objetivo.status === 'POR_AUTORIZAR') {
                await objetivo.update({
                    status: 'NUEVO'
                });
            }else{
                await objetivo.update({
                    status: 'ABIERTO'
                });
            }
        }

        const pivotOpUsuario = await PivotOpUsuario.findAll({
            where: {
                objetivoOperativoId: objetivo.id
            }
        });

        for (const pivot of pivotOpUsuario) {

            if(checked){

                if(pivot.status === 'NUEVO') {
                    await pivot.update({
                        status: 'PENDIENTE_AUTORIZAR'
                    });
                }else{
                    await pivot.update({
                        status: 'PENDIENTE_APROBACION'
                    });
                }
            }else{
                if(pivot.status === 'PENDIENTE_AUTORIZAR') {
                    await pivot.update({
                        status: 'NUEVO'
                    });
                }else{
                    await pivot.update({
                        status: 'ABIERTO'
                    });
                }
            }
        }

        await objetivo.reload({
            include: includes
        });

        res.json({
            ok: true,
            objetivo: {
                id: objetivo.id,
                status: objetivo.status,
            }
        })

    } catch (error) {
        console.log(error);

        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });
    }

}

// Renombrar
export const aprovacionObjetivo = async (req: Request, res: Response) => {

    const { checked, objetivoId, usuarioId } = req.body;


    const objetivoOperativo = await ObjetivoOperativos.findByPk(objetivoId);
    
    if(objetivoOperativo){
    
        const objetivo = await PivotOpUsuario.findOne({
            where: {
                objetivoOperativoId: objetivoId,
                usuarioId
            }
        });

        if(!objetivo) return res.status(404).json({ msg: 'No existe este objetivo' });
        

        if(objetivo.status === 'PENDIENTE_AUTORIZAR') {
            if(checked){       
                await objetivo.update({
                    status: 'ABIERTO'
                });
                await objetivoOperativo.update({
                    status: 'ABIERTO'
                })

                if(objetivo.propietario){
                    const pivot = await PivotOpUsuario.findAll({
                        where: {
                            objetivoOperativoId: objetivoOperativo.id
                        }
                    });

                    // abrir todos los objetivos
                    for (const pivotItem of pivot) {
                        await pivotItem.update({
                            status: 'ABIERTO'
                        });
                    }
                }
                
            }
        }else if(objetivo.status === 'ABIERTO'){
            if(!checked){
                await objetivo.update({
                    status: 'PENDIENTE_AUTORIZAR'
                });
                await objetivoOperativo.update({
                    status: 'POR_AUTORIZAR'
                })

                if(objetivo.propietario){
                    const pivot = await PivotOpUsuario.findAll({
                    where: {
                        objetivoOperativoId: objetivoOperativo.id
                    }
                });

                // nuevo todos los objetivos
                for (const pivotItem of pivot) {
                    await pivotItem.update({
                        status: 'PENDIENTE_AUTORIZAR'
                    });
                }
                }
            }
        }
        else if(objetivo.status === 'PENDIENTE_APROBACION') {
            if(checked){       
                await objetivo.update({
                    status: 'APROBADO'
                });
                await objetivoOperativo.update({
                    status: 'CERRADO'
                })
            }
        } else if(objetivo.status === 'APROBADO'){
            if(!checked){
                await objetivo.update({
                    status: 'PENDIENTE_APROBACION'
                });
                await objetivoOperativo.update({
                    status: 'POR_APROBAR'
                })
            }
        }
        
        await updateRendimiento({ usuarioId, year: objetivoOperativo.year, quarter: objetivoOperativo.quarter });

        const rendimiento = await Rendimiento.findOne({
            where: {
                usuarioId,
                year: objetivoOperativo.year,
                quarter: objetivoOperativo.quarter
            }
        });

        return res.json({
            ok: true,
            msg: 'Objetivo actualizado',
            objetivo,
            objetivoOperativo,
            rendimiento
        })
    }

    return res.status(404).json({ msg: 'No existe este objetivo' });   
}

