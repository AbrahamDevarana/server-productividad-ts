
import { Request, Response } from "express";
import { Listado, Task, Usuarios } from "../models";
import { io } from "../services/socketService";
import { UsuarioInterface } from "../interfaces";

const userSingleAttr = ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'iniciales', 'foto'];

const getInclues = ({id} : any) => {
    return [
        {
            model: Usuarios,
            attributes: ['id'],
            through: {
                attributes: ['orden'],
            },
            as: 'ordenListado',
        }, {
            model: Task,
            as: 'task',
            attributes: ['id', 'nombre', 'descripcion', 'prioridad', 'propietarioId', 'fechaFin', 'status', 'taskeableId', 'progreso'],
            include: [
            {
                model: Usuarios,
                as: 'propietario',
                attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'iniciales', 'email', 'foto', 'slug', 'leaderId'],
            }
        ]
        }
    ]
}


export const getListados = async (req: Request, res: Response) => {
    const { id } = req.user as UsuarioInterface;
    const { comiteId } = req.query;
    const where: any = {};

    if (comiteId) {
        where.comiteId = comiteId;
    }


    try {
        const listados = await Listado.findAll({
            where,
            include: getInclues({id})
        });

        res.status(200).json({listados});
    } catch (error) {
        res.status(500).json({ message: error });
    }
}


export const createListado = async (req: Request, res: Response) => {

    const { comiteId } = req.body;

    try {
        const listado = await Listado.create({ comiteId });
        await listado.reload({
            include: getInclues({id: (req.user as UsuarioInterface).id})
        });
        res.status(201).json({listado});
    } catch (error) {
        res.status(500).json({ message: error });
    }
}

export const updateListado = async (req: Request, res: Response) => {
    try {
        const listado = await Listado.findByPk(req.params.id);
        if (listado) {
            await listado.update(req.body);
            await listado.reload({
                include: getInclues({id: (req.user as UsuarioInterface).id})
            });
            res.status(200).json({listado});
        } else {
            res.status(404).json({ message: 'Listado no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: error });
    }
}

export const deleteListado = async (req: Request, res: Response) => {
    try {
        const listado = await Listado.findByPk(req.params.id);
        if (listado) {
            await listado.destroy();
            res.status(200).json({listado});
        } else {
            res.status(404).json({ message: 'Listado no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: error });
    }
}

