import { Request, Response } from "express";
import { ObjetivoOperativos, Usuarios, ResultadosClave, PivotOpUsuario, Task, Rendimiento, Tacticos, ObjetivoEstrategico, Departamentos, Comentarios } from "../models";
import dayjs from "dayjs";
import { Transaction } from "sequelize";
import { updateRendimiento } from "../helpers/updateRendimiento";
import { UsuarioInterface } from "../interfaces";

import database from "../config/database";
import { cierreCicloService, createObjectiveService, deleteObjectiveService, getObjectiveService, getObjectivesService, Ponderacion, updateObjectiveService, updatePonderacionesService } from "../services";
import { updateRendimientoService } from "../services/rendimientoService";


const includes = [
    {
        model: Usuarios,
        as: 'operativosResponsable',
        attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'iniciales', 'email', 'foto', 'slug', 'leaderId'],
        through: {
            attributes: ['propietario', 'progresoAsignado', 'progresoReal', 'extra', 'status'],
            as: 'scoreCard'
        },
        required: false,
        include: [ {
            model: Departamentos,
            as: 'departamento',
            attributes: ['id', 'nombre', 'areaId'],   
        }]
    },
    {
        model: Tacticos,
        as: 'tacticoOperativo',
        attributes: ['id', 'estrategicoId', 'tipoObjetivo', 'departamentoId'],
        include: [{
            model: ObjetivoEstrategico,
            as: 'estrategico',
            attributes: ['id', 'perspectivaId']
        }, {
            model: Departamentos,
            as: 'departamentos',
            attributes: ['id', 'nombre', 'areaId'],
        }]
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
            },
            {
                model: Comentarios,
                as: 'comentarios',
                attributes: ['id'],
                required: false,
                where: {
                    comentableType: 'TASK',
                },
            }
        ]
        },
        {
            model: Usuarios,
            as: 'propietario',
            attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'iniciales', 'email', 'foto', 'slug', 'leaderId'],
        },
       
    ]
    }
]


export const getOperativos = async (req:Request, res: Response) => {
    const { year, quarter, usuarioId } = req.query as { year: string, quarter: string, usuarioId: string };    
    try {
        const operativos = await getObjectivesService({year: parseInt(year), quarter: parseInt(quarter), usuarioId})     
        
        res.json({ operativos });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const updateOperativo = async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = req.body;

    try {
        const operativo = await updateObjectiveService({id, data})
        res.json({operativo});
    } catch (error) {
        console.log(error);
        
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const createOperativo = async (req: Request, res: Response) => {
    
    const data = req.body;

    try {
       const operativo = await createObjectiveService(data);

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
        await deleteObjectiveService(id);

        res.json({
            ok: true,
            msg: 'Objetivo eliminado'
        });
    
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
        const operativo = await getObjectiveService(id);
        res.json({operativo});
    
    } catch (error) {
        console.log(error);
        
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const setPonderaciones = async (req: Request, res: Response) => {
    const { id: usuarioId } = req.params;
    const { ponderaciones }: { ponderaciones: Ponderacion[] } = req.body;

    try {
        if (!Array.isArray(ponderaciones)) {
            return res.status(400).json({
                ok: false,
                msg: 'Las ponderaciones deben ser un arreglo válido',
            });
        }

        const updatedPonderaciones = await updatePonderacionesService(usuarioId, ponderaciones);

        return res.json({
            ok: true,
            ponderaciones: updatedPonderaciones,
            usuarioId,
        });
    } catch (error: any) {
        console.error(error);

        return res.status(500).json({
            ok: false,
            msg: error.message || 'Hable con el administrador',
        });
    }
};

export const cierreCiclo = async (req: Request, res: Response) => {

    const { usuarioId, year, quarter, objetivosId } = req.body;
    try {
        await cierreCicloService({ usuarioId, year, quarter, objetivosId });
        await updateRendimientoService({ usuarioId, year, quarter });

        res.json({
            ok: true,
            msg: 'Ciclo cerrado',
        })
        
    } catch (error) {

        console.log(error);

        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });
        
    }
}






export const statusObjetivo = async (req: Request, res: Response) => {

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
                operativosResponsable: objetivo.operativosResponsable?.map( (res: any) => {
                    return {
                        id: res.id,
                        scoreCard: res.scoreCard,
                    }
                })
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

export const copyOperativo = async (req: Request, res: Response) => {

    const { nombre, newYear, newQuarter, objetivoOperativoId, resultadosClave } = req.body;
    const { id } = req.user as UsuarioInterface

    const t: Transaction = await database.transaction();
    
    try {
        const operativo = await ObjetivoOperativos.findByPk(objetivoOperativoId, {
            include: includes,
        });

        if(!operativo) return res.status(404).json({ msg: 'No existe este objetivo' });

        const fechaInicial = dayjs().year(newYear).quarter(newQuarter).startOf('quarter').toDate();
        const fechaFinal = dayjs().year(newYear).quarter(newQuarter).endOf('quarter').subtract(1, 'day').toDate();

        // Crear Objetivo
        const operativoCopy = await ObjetivoOperativos.create({
            nombre: nombre,
            meta: operativo.meta,
            indicador: operativo.indicador,
            fechaInicio: fechaInicial,
            fechaFin: fechaFinal,
            quarter: newQuarter,
            year: newYear,
            status: 'NUEVO'
        }, { transaction: t });

        await t.commit();

        if(!operativoCopy){
            await t.rollback();
            return res.status(400).json({ msg: 'No se pudo crear el operativo' });
        }
    
        const setResponsables = new Set();
        
        // Asignar Responsables
        operativo.operativosResponsable?.forEach( (responsable: any) => {
            setResponsables.add(responsable.id);
        });

        await operativoCopy.setOperativosResponsable(Array.from(setResponsables));
        
        const responsablesLista = await PivotOpUsuario.findAll({
            where: {
                objetivoOperativoId: operativoCopy.id
            }
        });

        for (const responsable of responsablesLista) {
            const propietarioValue = responsable.usuarioId === id;
        
            await responsable.update({
                propietario: propietarioValue,
            });
        }

        await operativoCopy.reload();

        // Copiar Resultados Clave

        if(operativoCopy && operativoCopy.id){
            const resultadosArray = resultadosClave.map( (resultado: any) => resultado.id );

            const resultadosClaveCopy = await ResultadosClave.findAll({
                where: {
                    id: resultadosArray
                }
            });

            for (const resultado of resultadosClaveCopy) {
                
                await ResultadosClave.create({
                    nombre: resultado.nombre,
                    fechaInicio: resultado.fechaInicio,
                    fechaFin: resultado.fechaFin,
                    operativoId: operativoCopy.id,
                    status: 'SIN_INICIAR',
                    tipoProgreso: 'acciones',
                    progreso: 0,
                    propietarioId: id,
                    color: resultado.color
                }).then( async (resultadoClave) => {
                
                    const resultadoClaveTasks = resultadosClave.find( (res: any) => res.id === resultado?.id)?.tasks;    
                    await resultadoClave.reload();

                    const tasks = await Task.findAll({
                        where: {
                            id: resultadoClaveTasks,
                            taskeableType: 'RESULTADO_CLAVE'
                        }
                    });

                   if(resultadoClave && resultadoClave.id){
                        for (const task of tasks) {   
                            await Task.create({
                                nombre: task.nombre,
                                propietarioId: id,
                                taskeableId: resultadoClave.id,
                                taskeableType: 'RESULTADO_CLAVE',
                                prioridad: 'MEDIA',
                                status: 'SIN_INICIAR',
                                progreso: 0,
                                fechaFin: resultadoClave.fechaFin,
                            })   
                        }
                   }
                })
            }
        }

        await operativoCopy.reload( { include: includes });

        res.json({operativo: operativoCopy});
      
    } catch (error) {
        console.log(error);
        
        await t.rollback();
        
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}


