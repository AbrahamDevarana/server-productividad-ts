import { Request, Response } from "express";
import {  Evaluacion, AsignacionEvaluacion, EvaluacionPregunta, EvaluacionRespuesta, AsignacionPreguntaEvaluacion } from "../models/evaluacion"
import { Rendimiento, Usuarios } from "../models";
import { Op, Sequelize } from "sequelize";
import { updateRendimiento } from "../helpers/updateRendimiento";
import { CategoriaPreguntas } from "../models/evaluacion/CategoriaPreguntas";
import { EvaluacionPreguntaProps, EvaluacionResultadoProps } from "../interfaces";



enum TipoEvaluacion {
    EvaluacionLider = 1,
    EvaluacionColaborador = 2, //  Evaluación de colaborador a colaborador
    EvaluacionPropia = 3,
    EvaluacionLiderColaborador = 4, // Deprecated
    EvaluacionPares = 5, //  Evaluación de pares

}

//  Por usuario asignar QUIEN lo va a evaluar
export const asignarEvaluadoresEmpresa = async (req: Request, res: Response) => {

    const { year, quarter } = req.body

    const usuarios = await Usuarios.findAll({
        where: {
            status: 'ACTIVO'
        }
    })

    for(const usuario of usuarios) {
        const { id: evaluadoId } = usuario;
        const lider = await usuario.getLider()
        const subordinados = await usuario.getSubordinados()


        if(lider && lider.status){
            const evaluadorId = usuario.id;
            const existingEvaluacion = await AsignacionEvaluacion.findOne({
                where: {
                    evaluadorId,
                    evaluadoId,
                    year,
                    quarter
                }
            });
                    
            if(!existingEvaluacion && lider.status) {
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
                const existingEvaluacion = await AsignacionEvaluacion.findOne({
                    where: {
                        evaluadorId: usuario.id,
                        evaluadoId: subordinado.id,
                        year,
                        quarter,
                        evaluacionId: TipoEvaluacion.EvaluacionColaborador
                    }
                });
        
                if(!existingEvaluacion && subordinado.status) {
                    await AsignacionEvaluacion.create({
                        evaluadorId: usuario.id,
                        evaluadoId: subordinado.id,
                        year,
                        quarter,
                        evaluacionId: TipoEvaluacion.EvaluacionColaborador
                    });
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

        if(!existingEvaluacion && usuario.status) {
            await AsignacionEvaluacion.create({
                evaluadorId: usuario.id,
                evaluadoId: usuario.id,
                year,
                quarter,
                evaluacionId: tipoEv
            });
        }



        // Colaboradores de objetivos

        const operativos = await usuario.getObjetivosOperativos()
        
        for( const operativo of operativos ) {
            
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

    // encontrar a los de evaluacionId 1, 2, 3
    const evaluacionLider = usuariosEvaluaciones.find((usuario: any) => usuario.evaluacionId === TipoEvaluacion.EvaluacionLider)?.evaluado || null
    // Evaluación propia valida 2 cosas que sea tipoevaluacion.EvaluacionPropia o que el evaluadorId sea igual al evaluadoId
    const evaluacionPropia = usuariosEvaluaciones.find((usuario: any) => usuario.evaluacionId === TipoEvaluacion.EvaluacionPropia || usuario.evaluadorId === usuario.evaluadoId)?.evaluado || null
    const evaluacionColaborador = usuariosEvaluaciones.filter((usuario: any) => usuario.evaluacionId === TipoEvaluacion.EvaluacionColaborador).map((usuario: any) => usuario.evaluado)


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




// A partir de aquí es la nueva funcionalidad de evaluaciones

export const asignarEvaluaciones = async (req: Request, res: Response) => {
}

export const getEvaluaciones = async (req: Request, res: Response) => {
    
    const { year, quarter } = req.query as any;

    try {

        const usuarios = await Usuarios.findAll({
            attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'email', 'foto', 'slug'],
            include: [
                {
                    model: AsignacionEvaluacion,
                    as: 'evaluacionesEvaluado',
                    where: {
                        year,
                        quarter
                    },
                    required: false,
                    attributes: ['id', 'evaluadorId', 'evaluadoId', 'status', 'evaluacionId'],
                    include: [
                        {
                            model: Usuarios,
                            as: 'evaluador',
                            attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'email', 'foto', 'slug'],
                        },
                    ],
                }
            ],
            order: [
                ['nombre', 'ASC'],
            ],
        })
    
        return res.json({
            ok: true,
            usuarios
        })

    } catch (error) {

        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error inesperado'
        })
    }
}

export const getEvaluacion = async (req: Request, res: Response) => {

    const { id } = req.params;
    const { year, quarter } = req.query as any;

    try {

        const usuario = await Usuarios.findOne({
            where: {
                id
            },
            attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'email', 'foto', 'slug'],
            include: [
                {
                    model: AsignacionEvaluacion,
                    as: 'evaluacionesEvaluado',
                    where: {
                        year,
                        quarter
                    },
                    required: false,
                    attributes: ['id', 'evaluadorId', 'evaluadoId', 'status', 'evaluacionId'],
                    include: [
                        {
                            model: Usuarios,
                            as: 'evaluador',
                            attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'email', 'foto', 'slug'],
                        },
                    ],
                }
            ],
            order: [
                ['nombre', 'ASC'],
            ],
        })

        return res.json({
            ok: true,
            usuario
        })

    } catch (error) {

        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error inesperado'
        })
    }
}
    
export const createAsignacionEvaluacion = async (req: Request, res: Response) => {

    const { evaluadoId, evaluadorId, year, quarter, tipoEvaluacionId } = req.body;

    try {

        const asignacion = await AsignacionEvaluacion.findOne({
            where: {
                evaluadorId,
                evaluadoId,
                year,
                quarter,
                evaluacionId: tipoEvaluacionId
            }
        })

        if (asignacion) return res.status(400).json({ ok: false, msg: 'Ya existe una asignación para este usuario' })

        await AsignacionEvaluacion.create({
            evaluadorId,
            evaluadoId,
            year,
            quarter,
            evaluacionId: tipoEvaluacionId
        })

        return res.json({
            ok: true,
            msg: 'Asignación creada'
        })

    } catch (error) {

        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error inesperado'
        })
    }

}

export const deleteAsignacionEvaluacion = async (req: Request, res: Response) => {
    
        const { evaluadoId, evaluadorId, year, quarter, tipoEvaluacionId } = req.body;
        
        try {
    
            const asignacion = await AsignacionEvaluacion.findOne({
                where: {
                    evaluadorId,
                    evaluadoId,
                    year,
                    quarter,
                    evaluacionId: tipoEvaluacionId
                }
            })
                
            if (!asignacion) return res.status(404).json({ ok: false, msg: 'No existe la asignación' })
    
            await asignacion.destroy()
    
            return res.json({
                ok: true,
                msg: 'Asignación eliminada'
            })
    
        } catch (error) {
    
            console.log(error);
            return res.status(500).json({
                ok: false,
                msg: 'Error inesperado'
            })
        }
    
}

export const getEvaluacionResultadosCategoria = async (req: Request, res: Response) => {

    const { categoriaId, usuarioId, quarter, year } = req.query as any;

    try {

        const categoria = await CategoriaPreguntas.findOne({
            where: {
                id: categoriaId
            },
            include: [
                {
                    as: 'preguntas',
                    model: EvaluacionPregunta,
                    include: [
                        {
                            model: EvaluacionRespuesta,
                            attributes: ['resultado', 'comentario'],
                            where: {
                                status: true
                            },
                            include: [
                                {
                                    model: AsignacionEvaluacion,
                                    where: {
                                        year,
                                        quarter,
                                        evaluadoId: usuarioId
                                    },
                                    attributes: ['evaluadorId'],
                                }
                            ]
                        }
                    ]
                }
            ]
        })

    
        const resultadoPromedio = categoria?.preguntas?.flatMap((pregunta: any) => 
                pregunta.evaluacion_respuesta.map((respuesta: any) => respuesta.resultado)
        );

        const promedioTotal =  (resultadoPromedio && resultadoPromedio?.length > 0) ? (
            resultadoPromedio ? (resultadoPromedio.reduce((a: any, b: any) => a + b, 0) / resultadoPromedio.length) : 0
        ).toFixed(2) : 0;

        let usuarioRespuestas: string[] = [];
        let otrasRespuestas: string[] = [];

        categoria?.preguntas?.forEach((pregunta: EvaluacionPreguntaProps) => {            
            pregunta.evaluacion_respuesta.forEach((respuesta: any) => {
                if (respuesta.pivot_evaluacion_usuario.evaluadorId === usuarioId) {
                    usuarioRespuestas.push(respuesta.comentario);
                } else {
                    otrasRespuestas.push(respuesta.comentario);
                }
            });
        });

        const evaluacion: { categoria: string | undefined; resultado: EvaluacionResultadoProps | undefined } = {
            categoria: categoria?.nombre,
            resultado: {
                promedio: promedioTotal,
                respuestas: {
                    usuario: usuarioRespuestas,
                    otras: otrasRespuestas
                }
            }
        };

      
        return res.json({
            ok: true,
            evaluacion
        })

    } catch (error) {

        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error inesperado'
        })
    }
}

export const getCategoriasResultados = async (req: Request, res: Response) => {

    const { usuarioId, year, quarter } = req.query as any;    

    try {

        const result = await CategoriaPreguntas.findAll({
            include: [
                {
                    as: 'preguntas',
                    model: EvaluacionPregunta,
                    required: true,
                    include: [
                        {
                            model: EvaluacionRespuesta,
                            attributes: ['resultado', 'comentario'],
                            where: {
                                status: true
                            },
                            include: [
                                {
                                    model: AsignacionEvaluacion,
                                    where: {
                                        year,
                                        quarter,
                                        evaluadoId: usuarioId
                                    },
                                    attributes: ['evaluadorId'],
                                }
                            ]
                        }
                    ]
                }
            ]
        })

        const categorias = result.map((categoria: any) =>  ( {
            id: categoria.id,
            nombre: categoria.nombre,
        }))

        return res.json({
            ok: true,
            categorias
        })

    } catch (error) {

        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error inesperado'
        })
    }
}