import { Request, Response } from "express";
import {  Evaluacion, AsignacionEvaluacion, EvaluacionPregunta, EvaluacionRespuesta, AsignacionPreguntaEvaluacion } from "../models/evaluacion"
import { Rendimiento, Usuarios } from "../models";
import { Op } from "sequelize";
import { updateRendimiento } from "../helpers/updateRendimiento";


enum TipoEvaluacion {
    EvaluacionLider = 1,
    EvaluacionColaborador = 2,
    EvaluacionPropia = 3,
    EvaluacionLiderColaborador = 4
}

//  Por usuario asignar QUIEN lo va a evaluar
export const asignarEvaluadoresEmpresa = async (req: Request, res: Response) => {

    const { year, quarter } = req.body

    // const MAX_EVALUACIONES = 3

    const usuarios = await Usuarios.findAll({})

    for(const usuario of usuarios) {
        const { id: evaluadoId } = usuario;
        const lider = await usuario.getLider()
        const subordinados = await usuario.getSubordinados()


        if(lider){
            const evaluadorId = usuario.id;
            const existingEvaluacion = await AsignacionEvaluacion.findOne({
                where: {
                    evaluadorId,
                    evaluadoId,
                    year,
                    quarter
                }
            });
                    
            if(!existingEvaluacion) {
                await AsignacionEvaluacion.create({
                    evaluadorId,
                    evaluadoId: lider.id,
                    year,
                    quarter,
                    evaluacionId: TipoEvaluacion.EvaluacionLider
                });
            }
        }

        if(subordinados.length > 0) {
            await Promise.all(subordinados.map(async (subordinado: any) => {
                // Verificar si ya existe una evaluación por este evaluador
                const existingEvaluacion = await AsignacionEvaluacion.findOne({
                    where: {
                        evaluadorId: usuario.id,
                        evaluadoId: subordinado.id,
                        year,
                        quarter,
                        evaluacionId: TipoEvaluacion.EvaluacionColaborador
                    }
                });
        
                if(!existingEvaluacion) {
                    await AsignacionEvaluacion.create({
                        evaluadorId: usuario.id,
                        evaluadoId: subordinado.id,
                        year,
                        quarter,
                        evaluacionId: TipoEvaluacion.EvaluacionColaborador
                    });
        
                    // console.log(`  ${usuario.nombre} Evalua a Subordinado: ${subordinado.nombre} ${subordinado.apellidoPaterno} ${subordinado.apellidoMaterno} `);
                }
            }))
        }
        
        const tipoEv = subordinados.length > 0 ? TipoEvaluacion.EvaluacionLiderColaborador : TipoEvaluacion.EvaluacionPropia
        // Verificar si ya existe una autoevaluación para este usuario en el año y trimestre específico
        const existingEvaluacion = await AsignacionEvaluacion.findOne({
            where: {
                evaluadorId: usuario.id,
                evaluadoId: usuario.id,
                year,
                quarter,
                evaluacionId: tipoEv
            }
        });

        if(!existingEvaluacion) {
            await AsignacionEvaluacion.create({
                evaluadorId: usuario.id,
                evaluadoId: usuario.id,
                year,
                quarter,
                evaluacionId: tipoEv
            });
        }

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

    // console.log(usuariosEvaluaciones);
    

    // encontrar a los de evaluacionId 1, 2, 3
    const evaluacionLider = usuariosEvaluaciones.find((usuario: any) => usuario.evaluacionId === TipoEvaluacion.EvaluacionLider)?.evaluado || null
    // Evaluación propia valida 2 cosas que sea tipoevaluacion.EvaluacionPropia o que el evaluadorId sea igual al evaluadoId
    const evaluacionPropia = usuariosEvaluaciones.find((usuario: any) => usuario.evaluacionId === TipoEvaluacion.EvaluacionPropia || usuario.evaluadorId === usuario.evaluadoId)?.evaluado || null
    const evaluacionColaborador = usuariosEvaluaciones.filter((usuario: any) => usuario.evaluacionId === TipoEvaluacion.EvaluacionColaborador).map((usuario: any) => usuario.evaluado)
    
    // console.log('Evaluacion Lider',  evaluacionLider);
    // console.log('Evaluacion Propia', evaluacionPropia);
    // console.log('Evaluacion Colaborador', evaluacionColaborador.map((usuario: any) => usuario.nombre));
    

    return res.json({
        ok: true,
        evaluacionColaborador,
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

        await updateRendimiento({ usuarioId: asignacion.evaluadoId, quarter, year })

        const rendimiento = await Rendimiento.findOne({
            where: {
                usuarioId: asignacion.evaluadoId,
                year,
                quarter
            }
        })

        const resultado = rendimiento? ((rendimiento.resultadoCompetencias / 10) * 5).toFixed(2) : 0

        asignacion.status = true;
        await asignacion.save()

        return res.json({
            ok: true,
            promedio: resultado,
            isAutoevaluacion: asignacion.evaluadoId === asignacion.evaluadorId,
            rendimiento
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

export const obtenerResultadoEvaluacionLider = async (req: Request, res: Response) => {

    const { id } = req.params;
    const { year, quarter } = req.query as any;
    try {

        //  Obtener quien me evaluó

        const miEvaluacion = await AsignacionEvaluacion.findAll({
            where: {
                evaluadoId: id,
                year,
                quarter,
            },
            include: [
                {
                    model: Usuarios,
                    as: 'evaluador',
                    attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'email', 'foto', 'slug'],
                },
                {
                    model: EvaluacionRespuesta,
                }
            ]
        })

        const misEvaluados = await AsignacionEvaluacion.findAll({
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
                },
                {
                    model: EvaluacionRespuesta,
                }
            ]
        })
            
      

        res.json({
            ok: true,
            evaluacionResultados: miEvaluacion,
            evaluacionResultadosColaboradores: misEvaluados
        })
    
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error inesperado'
        })
    }

}

export const obtenerRespuestasEvaluacion = async (req: Request, res: Response) => {

    const { id } = req.params;
    const { year, quarter } = req.query as any;

    try {


        const asignaciones = await AsignacionEvaluacion.findAll({
            where: {
                evaluadoId: id,
                year,
                quarter
            },
            include: [
                {
                    model: EvaluacionRespuesta,
                    include: [
                        {
                            model: EvaluacionPregunta,
                        },
                        {
                            model: Evaluacion
                        }
                    ]
                },
                
            ]
        })
        

        const nuevaEstructura: any[] = [];

    return res.json({
        ok: true,
        asignaciones
    })
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error inesperado'
        })
    }
}