import { Request, Response } from "express";
import { Evaluacion, Usuarios } from "../models";
import { PivotEvaluacionUsuario } from "../models/pivot/PivotEvaluacionUsuario";
import { UsuarioInterface } from "../interfaces";

// Este controller es de la interacion del usuario con la evaluacion
// 


export const createEvaluacionByUsuario = async (req: Request, res: Response) => {
    
    const { quarter, year } = req.body;
    const { id } = req.user as UsuarioInterface
    
try {

    // econtrar al lider de ese usuario
    const usuario = await Usuarios.findByPk(id);

    if (!usuario) {
        return res.status(404).json({
            msg: 'No existe el usuario',
            ok: false
        });
    }

    const lider = await usuario.getLider();
    const subordinados = await lider.getSubordinados();


    // crear la evaluacion

    // Si tengo un lider evaluadorId = 1 sino 2
    const evaluacion = await PivotEvaluacionUsuario.findOrCreate({
        where: {
            evaluacionId: 1,
            evaluadorId: lider.id,
            evaluadoId: id,
            quarter: quarter,
            year: year
        }
    });

    const autoevaluacion = await PivotEvaluacionUsuario.findOrCreate({
        where: {
            evaluacionId: 2,
            evaluadorId: id,
            evaluadoId: id,
            quarter: quarter,
            year: year
        }
    });
    

    if(subordinados.length > 0){
        await Promise.all(subordinados.map(async (subordinado : any) => {
            await PivotEvaluacionUsuario.findOrCreate({
                where: {
                    evaluacionId: 1,
                    evaluadorId: subordinado.id,
                    evaluadoId: id,
                    quarter: quarter,
                    year: year
                }
            });
        }
    ));
    }

    return res.status(201).json({
        msg: 'Evaluacion creada',
        evaluacion,
        autoevaluacion,
        ok: true

    });
    
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: 'Error interno'
        });
    }
}


export const createEvaluacionRandom = async (req: Request, res: Response) => {
    
    const { quarter, year } = req.body;

    const { id } = req.user as UsuarioInterface

    try {

        // Encontrar a todos los usuarios que 

        const usuario = await Usuarios.findByPk(id)

        const responsablesSet = new Set();
        const objetivos = await usuario.getResponsableOperativos()

        for (const objetivo of objetivos) {
            const responsables = await objetivo.getOperativosResponsable();
            for (const responsable of responsables) {
                responsablesSet.add(responsable.id);
            }
        }

        const responsablesArray = Array.from(responsablesSet);

        await PivotEvaluacionUsuario.bulkCreate(responsablesArray.map((responsableId) => {
            return {
                evaluacionId: 2,
                evaluadorId: responsableId,
                evaluadoId: id,
                quarter: quarter,
                year: year
            }
        }));

        if (!usuario) {
            return res.status(404).json({
                msg: 'No existe el usuario',
                ok: false
            });
        }

        return res.status(201).json({
            msg: 'Evaluacion creada',
            ok: true
        });
        
            
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: 'Error interno',
            ok: false
        })
    }
}


export const getEvaluacionesByUsuario = async (req: Request, res: Response) => {

    const { id } = req.params;
    

    try {

        const usuario = await Usuarios.findByPk(id);

        if (!usuario) {
            return res.status(404).json({
                msg: 'No existe el usuario',
                ok: false
            });
        }

        const evaluaciones = await usuario.getEvaluacionesRecibidas();

        return res.status(200).json({
            msg: 'Evaluaciones encontradas',
            evaluaciones,
            ok: true
        });
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: 'Error interno'
        });
    }
}


    