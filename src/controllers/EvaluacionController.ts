import { Request, Response } from "express";

import {  Evaluacion, AsignacionEvaluacion, EvaluacionPregunta, EvaluacionRespuesta } from "../models/evaluacion"
import { Usuarios } from "../models";
import database from "../config/database";


enum TipoEvaluacion {
    EvaluacionLider = 1,
    EvaluacionColaborador = 2
}


export const asignarEvaluadores = async (req: Request, res: Response) => {

    const { usuarioId, year, quarter } = req.body;

    try {
        // Buscar Coolaboradores
        const usuario = await Usuarios.findByPk(usuarioId, {})
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

        // Sin repetidos
        const colaboradores = objetivos.map((objetivo: any) => objetivo.operativosResponsable).flat().filter((colaborador: any) => colaborador.id !== usuarioId).filter((colaborador: any, index: number, self: any) => self.findIndex((t: any) => t.id === colaborador.id) === index)

        const colaboradoresIds = colaboradores.map((colaborador: any) => colaborador.id)

        // Contar evaluaciones asignadas al usuario
        const evaluacionesActuales = await AsignacionEvaluacion.findAll({
            where: {
                evaluadoId: usuarioId,
                year,
                quarter,
                evaluacionId: TipoEvaluacion.EvaluacionColaborador
            }
        })

        // Si ya se asignaron evaluadores para el usuario, no se puede asignar mas
        if (evaluacionesActuales.length >= 3) return res.status(400).json({
            ok: false,
            msg: 'Ya se asignaron evaluadores para este usuario'
        })

        const numeroEvaluadoresActuales = evaluacionesActuales.length

        
        if(numeroEvaluadoresActuales < 3){
            const idsYaAsignados = evaluacionesActuales.map((evaluacion: any) => evaluacion.evaluadorId)
            const idsPosibles = colaboradoresIds.filter((id: any) => !idsYaAsignados.includes(id))

            // Obtener ids aleatorios de los colaboradores
            const idsAsignar = idsPosibles.sort(() => Math.random() - Math.random()).slice(0, 3 - numeroEvaluadoresActuales)

            console.log('idsAsignar', idsAsignar);
            

            // Crear evaluaciones para los colaboradores

            for (const id of idsAsignar) {

                console.log('ID Asignar', id);
                
                await AsignacionEvaluacion.create({
                    evaluadorId: id,
                    evaluadoId: usuarioId,
                    year,
                    quarter,
                    evaluacionId: TipoEvaluacion.EvaluacionColaborador
                })
            }
        }

        const evaluacionLider = await AsignacionEvaluacion.findOne({
            where: {
                evaluadoId: usuarioId,
                year,
                quarter,
                evaluacionId: TipoEvaluacion.EvaluacionLider
            }
        })

        if (!evaluacionLider) {
            const lider = await usuario.getLider()
            console.log('Lider', lider.id);
            
            await AsignacionEvaluacion.create({
                evaluadorId: lider.id,
                evaluadoId: usuarioId,
                year,
                quarter,
                evaluacionId: TipoEvaluacion.EvaluacionLider
            })
        }

        return res.json({
            ok: true,
            msg: 'Evaluadores asignados',
        })

    } catch (error) {
        
        console.log(error)
        return res.status(500).json({
            ok: false,
            msg: 'Error inesperado'
        })
    }



}

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
    const {  year, quarter, asignadorId } = req.query as any;

   try {
        const asignacion = await AsignacionEvaluacion.findOne({
            where: {
                year,
                quarter,
                evaluadorId: asignadorId,
                evaluadoId: id
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

        console.log('Asignacion', asignacion);
        


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
        const respuestasPreparadas = respuestas.map((respuesta: any) => ({
            resultado: respuesta.rate,
            comentario: respuesta.comentarios,
            evaluacionId: evaluacionId,
            evaluacionUsuarioId: usuarioId,
            evaluacionPreguntaId: respuesta.preguntaId,
        }))


        await EvaluacionRespuesta.bulkCreate(respuestasPreparadas)

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

        asignacion.status = true;
        await asignacion.save()

        return res.json({
            ok: true,
            msg: 'Evaluacion guardada'
        })
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            ok: false,
            msg: 'Error inesperado'
        })
        
    }

}


// Deprecated 
export const createEvaluacionEquipo = async (req: Request, res: Response) => {

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


