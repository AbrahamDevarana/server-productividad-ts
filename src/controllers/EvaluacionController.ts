import { Request, Response } from "express";

import {  Evaluacion, EvaluacionPregunta, EvaluacionRespuesta, PivotEvaluacionUsuario } from "../models/evaluacion"
import { Usuarios } from "../models";
import database from "../config/database";


enum TipoEvaluacion {
    EvaluacionLider = 1,
    EvaluacionColaborador = 2
}


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
        const evaluacionLider = await PivotEvaluacionUsuario.findOrCreate({
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
            return await PivotEvaluacionUsuario.findOrCreate({
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

                return await PivotEvaluacionUsuario.findOrCreate({
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

export const updateEvaluacionPreguntas = async (req: Request, res: Response) => {

    const {evaluacionId, preguntas} = req.body;
    
    try {

        const evaluacion = await Evaluacion.findByPk(evaluacionId, {})
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

export const getEvaluacion = async (req: Request, res: Response) => {
    const { evaluadorId, year, quarter, usuarioId } = req.body;

    console.log(req.body);
    console.log(req.params);
    

    

    try {
        const evaluacion = await PivotEvaluacionUsuario.findOne({
            where: {
                evaluadorId,
                evaluadoId: usuarioId,
                year,
                quarter
            },
            include: [
                {
                    model: Evaluacion,
                    as: 'evaluacionUsuario',
                    attributes: ['id', 'nombre', 'descripcion'],
                    include: [
                        {
                            model: EvaluacionPregunta,
                            as: 'preguntasEvaluacion',
                            through: {
                                attributes: []
                            },
                            include: [
                                {
                                    model: EvaluacionRespuesta,
                                    as: 'respuestaPregunta',
                                }
                            ]
                        },
                       
                    ]
                }
            ]
        })

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

