import { Request, Response } from "express";
import { Op } from "sequelize";
import { Evaluacion, EvaluacionPregunta, EvaluacionUsuario, Pregunta, Respuesta } from "../models/evaluacion"


export const getUsuariosEvaluados = async (req: Request, res: Response) => {
}