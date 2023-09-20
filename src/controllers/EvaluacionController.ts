import { Request, Response } from "express";

import {  Evaluacion, AsignacionEvaluacion, EvaluacionPregunta, EvaluacionRespuesta } from "../models/evaluacion"
import { Usuarios } from "../models";
import database from "../config/database"; 
import dayjs from "dayjs";
import { Op } from "sequelize";


enum TipoEvaluacion {
    EvaluacionLider = 1,
    EvaluacionColaborador = 2
}

//  Por usuario asignar QUIEN lo va a evaluar
export const asignarEvaluadoresEmpresa = async (req: Request, res: Response) => {


    const year = dayjs().year()
    const quarter = Math.ceil((dayjs().month() + 1) / 3)

    const usuarios = await Usuarios.findAll({})

    for(const usuario of usuarios) {

        const evaluacionLider = await AsignacionEvaluacion.findOne({
            where: {
                evaluadoId: usuario.id,
                year,
                quarter,
                evaluacionId: TipoEvaluacion.EvaluacionLider
            }
        })

       if(!evaluacionLider) {

        const lider = await usuario.getLider()            
            if(lider){
                await AsignacionEvaluacion.create({
                    evaluadorId: lider.id,
                    evaluadoId: usuario.id,
                    year,
                    quarter,
                    evaluacionId: TipoEvaluacion.EvaluacionLider
                })
                console.log(`El usuario ${usuario.nombre} tiene lider ${lider.nombre}`);
                
            }else {
                console.log(`El usuario ${usuario.nombre} no tiene lider`)
            }
        }

        // evaluarse a si mismo

        const evaluacionColaborador = await AsignacionEvaluacion.findOne({
            where: {
                evaluadoId: usuario.id,
                evaluadorId: usuario.id,
                year,
                quarter,
                evaluacionId: TipoEvaluacion.EvaluacionColaborador
            }
        })

        if(!evaluacionColaborador) {

            await AsignacionEvaluacion.create({
                evaluadorId: usuario.id,
                evaluadoId: usuario.id,
                year,
                quarter,
                evaluacionId: TipoEvaluacion.EvaluacionColaborador
            })
            console.log(`El usuario ${usuario.nombre} se evaluara a si mismo`);
            
        }
    }

    // console.log('Asignacion de evaluadores terminada');
    return res.json({
        ok: true,
        msg: 'Evaluadores asignados',
    })
    
}

// OBTENGO MIS EVALUADORES
export const obtenerEvaluadores = async (req: Request, res: Response) => {

    const { year, quarter } = req.query as any;

    const { id } = req.params;

    const evaluadoresColaboradores = await AsignacionEvaluacion.findAll({
        where: {
            evaluadoId: id,
            year,
            quarter,
            evaluacionId: TipoEvaluacion.EvaluacionColaborador
        },
        include: [
            {
                model: Usuarios,
                as: 'evaluador',
                attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'email', 'foto', 'slug'],
            }
        ]
    })

    const evaluadorLider = await AsignacionEvaluacion.findOne({
        where: {
            evaluadoId: id,
            year,
            quarter,
            evaluacionId: TipoEvaluacion.EvaluacionLider
        },
        include: [
            {
                model: Usuarios,
                as: 'evaluador',
                attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'email', 'foto', 'slug'],
            }
        ]
    })


    const colaboradores = evaluadoresColaboradores.map((evaluador: any) => evaluador.evaluador)
    const lider = evaluadorLider?.evaluador

    return res.json({
        ok: true,
        evaluadorLider: lider,
        evaluadoresColaboradores: colaboradores
    })

}

// OBTENGO LOS USUARIOS QUE VOY A EVALUAR
export const obtenerUsuariosAEvaluar = async (req: Request, res: Response) => {
    const { year, quarter } = req.query as any;
    const { id } = req.params;

    const usuariosColaborador = await AsignacionEvaluacion.findAll({
        where: {
            evaluadorId: id,
            year,
            quarter,
            evaluacionId: TipoEvaluacion.EvaluacionColaborador
        },
        include: [
            {
                model: Usuarios,
                as: 'evaluado',
                attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'email', 'foto', 'slug'],
            }
        ]
    })

    const usuariosLider = await AsignacionEvaluacion.findAll({
        where: {
            evaluadorId: id,
            year,
            quarter,
            evaluacionId: TipoEvaluacion.EvaluacionLider
        },
        include: [
            {
                model: Usuarios,
                as: 'evaluado',
                attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'email', 'foto', 'slug'],
            }
        ]
    })

    const colaboradores = usuariosColaborador.map((usuario: any) => usuario.evaluado)
    const lider = usuariosLider.map((usuario: any) => usuario.evaluado)

    return res.json({
        ok: true,
        usuariosColaborador: colaboradores,
        usuariosLider: lider
    })

}

export const obtenerEvaluacion = async (req: Request, res: Response) => {

    const { id } = req.params;
    const {  year, quarter, evaluadoId } = req.query as any;


    try {
        const asignacion = await AsignacionEvaluacion.findOne({
            where: {
                year,
                quarter,
                evaluadorId: id,
                evaluadoId: evaluadoId
            }  
        })
        if (!asignacion) return res.status(404).json({ ok: false, msg: 'Asignacion no encontrada' })

        const evaluacion = await Evaluacion.findOne({
            where: {
                id: asignacion.evaluacionId
            },
            include: [
                {
                    model: EvaluacionPregunta,
                    as: 'preguntasEvaluacion',
                }
            ]
        })



        return res.json({
            ok: true,
            evaluacion,
            asignacion
        })
        
   } catch (error) {
        console.log(error)
        return res.status(500).json({
            ok: false,
            msg: 'Error inesperado'
        })
   }
}

export const asignarPreguntasEvaluacion = async (req: Request, res: Response) => {

    const {evaluacionId, preguntas} = req.body;
    
    try {

        const evaluacion = await Evaluacion.findOne({
            where: {
                id: evaluacionId
            }
        })
        if (!evaluacion) return res.status(404).json({ ok: false, msg: 'Evaluacion no encontrada' })

        evaluacion.setPreguntasEvaluacion(preguntas)

        return res.json({
            ok: true,
            evaluacion
        })
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            ok: false,
            msg: 'Error inesperado'
        })
    }
}

export const guardarEvaluacion = async (req: Request, res: Response) => {
    const { respuestas, year, quarter, evaluacionId, usuarioId, evaluacionUsuarioId } = req.body;

    console.log(evaluacionUsuarioId);
    

    try {


        const asignacion = await AsignacionEvaluacion.findOne({
            where: {
                evaluadoId: evaluacionUsuarioId,
                evaluadorId: usuarioId,
                year,
                quarter,
                evaluacionId: evaluacionId

            }
        })

        if (!asignacion) return res.status(404).json({ ok: false, msg: 'Asignacion no encontrada' })


        const respuestasPreparadas = respuestas.map((respuesta: any) => ({
            resultado: respuesta.rate,
            comentario: respuesta.comentarios,
            evaluacionId: evaluacionId,
            evaluacionPreguntaId: respuesta.preguntaId,
            evaluacionUsuarioId: asignacion.id
        }))


        await EvaluacionRespuesta.bulkCreate(respuestasPreparadas)


        console.log('evaluacionUsuarioId', evaluacionUsuarioId);
        console.log('usuarioId', usuarioId);
        
        

      

        asignacion.status = true;
        await asignacion.save()

        return res.json({
            ok: true,
            msg: 'Evaluacion guardada',
            asignacion
        })
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            ok: false,
            msg: 'Error inesperado'
        })
        
    }

}

export const obtenerResultadoEvaluacion = async (req: Request, res: Response) => {

    const { id } = req.params;
    const { year, quarter } = req.query as any;
    try {

        const asignaciones = await AsignacionEvaluacion.findAll({
            where: {
                evaluadoId: id,
                year,
                quarter
            }
        })
        const evaluacionsId = asignaciones.map((asignacion: any) => asignacion.id)
        if (!asignaciones) return res.status(404).json({ ok: false, msg: 'Asignacion no encontrada' })

        const respuestas = await EvaluacionRespuesta.findAll({
            where: {
                evaluacionUsuarioId: {
                    [Op.in]: evaluacionsId
                }
            }
                
            
        })
        
        if (respuestas.length === 0) return res.json({ ok: true, promedio: 0, respuestas: [] })
        

        const promedio = respuestas.reduce((acc: any, respuesta: any) => acc + respuesta.resultado, 2) / respuestas.length
        
        console.log(promedio);
        
        return res.json({
            ok: true,
            respuestas,
            promedio
        })  

        


        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error inesperado'
        })
    }

}



// Deprecated 
export const createEvaluacionEquipo = async (req: Request, res: Response) => {

    throw new Error('Deprecated')
    const  { usuarioId, year, quarter } = req.body;

    const t = await database.transaction();

    try {
        // Obtener lider o subordinado del usuario 
        const usuario = await Usuarios.findByPk(usuarioId, {})

        if (!usuario) return res.status(404).json({ ok: false, msg: 'Usuario no encontrado' })

        const lider = await usuario.getLider()
        const subordinados = await usuario.getSubordinados()

        
        // Crear evaluacionusuario para el lider
        const evaluacionLider = await AsignacionEvaluacion.findOrCreate({
            where: {
                evaluadorId: lider.id,
                evaluadoId: usuario.id,
                year,
                quarter,
                evaluacionId: TipoEvaluacion.EvaluacionLider
            }
        })

        // Crear evaluacionusuario para cada subordinado
        
        const evaluacionesSubordinados = await Promise.all(subordinados.map(async (subordinado: any) => {
            return await AsignacionEvaluacion.findOrCreate({
                where: {
                    evaluadorId: subordinado.id,
                    evaluadoId: usuario.id,
                    year,
                    evaluacionId: TipoEvaluacion.EvaluacionColaborador,
                    quarter
                }
            })
        }))

        await t.commit();

        return res.json({
            ok: true,
            evaluacionLider,
            evaluacionesSubordinados
        })
        
    } catch (error) {
        await t.rollback();
        console.log(error)
        return res.status(500).json({
            ok: false,
            msg: 'Error inesperado'
        })
    }
}

export const createEvaluacionCoolaboradores = async (req: Request, res: Response) => {

    throw new Error('Deprecated')
    const { usuarioId, year, quarter } = req.body;

    const t = await database.transaction();

    try {

        const usuario = await Usuarios.findByPk(usuarioId, {})
        if (!usuario) return res.status(404).json({ ok: false, msg: 'Usuario no encontrado' })

        const objetivos = await usuario.getObjetivosOperativos({
            where: {
                year,
                quarter
            },
            include: [
                {
                    association: 'operativosResponsable',
                    attributes: ['id', 'nombre']
                }
            ]
        })
        
        
        //  de cada Objetivo en Objetivos obtener los Usuarios Coolaboradores, quitar al usuarioId y crear evaluacionUsuario

        const evaluaciones = await Promise.all(objetivos.map(async (objetivo: any) => {
            const colaboradores = objetivo.operativosResponsable.filter((res: any) => res.id !== usuario.id)

            
            return await Promise.all(colaboradores.map(async (colaborador: any) => {

                return await AsignacionEvaluacion.findOrCreate({
                    where: {
                        evaluadorId: colaborador.id,
                        evaluadoId: usuario.id,
                        year,
                        quarter,
                        evaluacionId: TipoEvaluacion.EvaluacionColaborador
                    },
                })
            }))
        }))
        
    
        await t.commit();

        return res.json({
            ok: true,
            evaluaciones
        })
        
    } catch (error) {

        t.rollback();
        console.log(error)
        return res.status(500).json({
            ok: false,
            msg: 'Error inesperado'
        })
    }
}

export const getEvaluacion = async (req: Request, res: Response) => {
    const { year, quarter } = req.query as any;
    const { id, } = req.params;
    
    throw new Error('Deprecated')
    try {

        const usuario = await Usuarios.findByPk(id, {})

        if (!usuario) return res.status(404).json({ ok: false, msg: 'Usuario no encontrado' })

        const usuarios = await usuario.getEvaluacionesRealizadas({
            include: [
            {
                model: Usuarios,
                as: 'usuarioEvaluado',
                attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'email', 'foto', 'slug'],
            },
            {
                model: Usuarios,
                as: 'usuarioEvaluador',
                attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'email', 'foto', 'slug'],
            }
        ],
            where: {
                year,
                quarter
            },
            distinct: true
        })

        

        const usuariosSet = new Set()

        usuarios.map(
            (usuario: any) => {
                // si el usuario evaluado es el mismo que el usuario que hace la petición no se agrega
                if (usuario.usuarioEvaluado.id === usuario.usuarioEvaluador.id) return
                usuariosSet.add(usuario.usuarioEvaluado)
            }
        )

        const usuariosArray = Array.from(usuariosSet)
        
        return res.json({
            ok: true,
            usuariosEvaluados: usuariosArray
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            ok: false,
            msg: 'Error inesperado'
        }) 
    } 
}


