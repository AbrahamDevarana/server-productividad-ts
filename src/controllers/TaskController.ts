import { Request, Response } from "express";
import { Task, Usuarios } from "../models";
import { UsuarioInterface } from "../interfaces";
import dayjs from "dayjs";


const includes = [
    {
        model: Usuarios,
        as: 'propietario',
        attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'iniciales', 'email', 'foto', 'slug', 'leaderId'],
    }
]


export const getTask = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const task = await Task.findByPk(id);

        if (!task) {
            return res.status(404).json({
                msg: 'No existe una tarea'
            });
        }

        res.json({ task });
    }
    catch (error) {
        console.log(error);

        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const createTask = async (req: Request, res: Response) => {

    const { nombre, taskeableId, quarter } = req.body;
    const {id: propietarioId} = req.user as UsuarioInterface

    try {
                         
            const task = await Task.create({
                nombre,
                taskeableId,
                propietarioId: propietarioId,
                fechaFin: dayjs().endOf(quarter).toDate(),
                status: 'SIN_INICIAR',
                prioridad: 'NORMAL',
                taskeableType: 'RESULTADO_CLAVE',
            });

            await task.reload({
                include: includes
            })
    
            res.json({ task });                         
    } catch (error) {
        console.log(error);

        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}   

export const updateTask = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { nombre, propietarioId, taskeableId, status, fechaFin, prioridad } = req.body;

    try {
        const task = await Task.findByPk(id);

        if (!task) {
            return res.status(404).json({
                msg: 'No existe una tarea'
            });
        }

        await task.update({
            nombre,
            propietarioId,
            taskeableId,
            fechaFin,
            status,
            prioridad
        });

        await task.reload({
            include: includes
        })

        res.json({ task });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const deleteTask = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const task = await Task.findByPk(id);

        if (!task) {
            return res.status(404).json({
                msg: 'No existe una tarea'
            });
        }

        await task.destroy();

        res.json({ task });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        }); 
    }
}