import { Request, Response } from "express";

import {  Evaluacion, AsignacionEvaluacion, EvaluacionPregunta, EvaluacionRespuesta } from "../models/evaluacion"
import { Rendimiento, Usuarios } from "../models";
import { Op } from "sequelize";


enum TipoEvaluacion {
    EvaluacionLider = 1,
    EvaluacionColaborador = 2,
    EvaluacionPropia = 3
}

//  Por usuario asignar QUIEN lo va a evaluar
export const asignarEvaluadoresEmpresa = async (req: Request, res: Response) => {

    const { year, quarter } = req.body

    // const MAX_EVALUACIONES = 3

    const usuarios = await Usuarios.findAll({})


    for(const usuario of usuarios) {

        const evaluacion = await AsignacionEvaluacion.findAll ({
            where: {
                evaluadoId: usuario.id,
                year,
                quarter
            }
        })

        const lider = await usuario.getLider()
        const subordinados = await usuario.getSubordinados()


        if(lider){
            const evaluacionLider = evaluacion.find((evaluacion: any) => evaluacion.evaluacionId === TipoEvaluacion.EvaluacionLider)
        
            if (!evaluacionLider) {
                await AsignacionEvaluacion.create({
                    evaluadorId: usuario.id,
                    evaluadoId: lider.id,
                    year,
                    quarter,
                    evaluacionId: TipoEvaluacion.EvaluacionLider
                })

                // console.log(`Asignado lider ${lider.nombre} a ${usuario.nombre}`);
                
            }
        }

       if(subordinados.length > 0) {
            const evaluacionColaborador = evaluacion.find((evaluacion: any) => evaluacion.evaluacionId === TipoEvaluacion.EvaluacionColaborador)
            if (!evaluacionColaborador) {
                await Promise.all(subordinados.map(async (subordinado: any) => {
                    await AsignacionEvaluacion.create({
                        evaluadorId: usuario.id,
                        evaluadoId: subordinado.id,
                        year,
                        quarter,
                        evaluacionId: TipoEvaluacion.EvaluacionColaborador
                    })
                }))
                // console.log(`Asignado colaboradores a ${usuario.nombre}`);
                
            }
       }

        const evaluacionPropia = evaluacion.find((evaluacion: any) => evaluacion.evaluacionId === TipoEvaluacion.EvaluacionPropia)
        if (!evaluacionPropia) {
            await AsignacionEvaluacion.create({
                evaluadorId: usuario.id,
                evaluadoId: usuario.id,
                year,
                quarter,
                evaluacionId: TipoEvaluacion.EvaluacionPropia
            })
        }
        // console.log(`Asignado evaluacion propia a ${usuario.nombre}`);
        
    }
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


    const usuariosEvaluaciones = await AsignacionEvaluacion.findAll({
        where: {
            evaluadorId: id,
            year,
            quarter,
        },
        include: [
            {
                model: Usuarios,
                as: 'evaluado',
                attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'email', 'foto', 'slug'],
            }
        ]
    })

    // encontrar a los de evaluacionId 1, 2, 3
    const evaluacionLider = usuariosEvaluaciones.find((usuario: any) => usuario.evaluacionId === TipoEvaluacion.EvaluacionLider)?.evaluado
    const evaluacionPropia = usuariosEvaluaciones.find((usuario: any) => usuario.evaluacionId === TipoEvaluacion.EvaluacionPropia)?.evaluado
    // const colaboradores = usuariosEvaluaciones.filter((usuario: any) => usuario.evaluacionId === TipoEvaluacion.EvaluacionColaborador).map((usuario: any) => usuario.evaluado)
    

    return res.json({
        ok: true,
        // evaluacionColaborador: colaboradores,
        evaluacionLider,
        evaluacionPropia
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

        const promedio = await Rendimiento.findOne({
            where: {
                usuarioId: id,
                year,
                quarter
            }
        })
        const resultado = promedio? ((promedio.resultadoCompetencias / 10) * 5).toFixed(2) : 0

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
        return res.json({
            ok: true,
            respuestas,
            promedio: resultado
        })  

        


        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error inesperado'
        })
    }

}

