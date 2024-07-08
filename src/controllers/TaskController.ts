import { Request, Response } from "express";
import { Task, Usuarios } from "../models";
import { UsuarioInterface } from "../interfaces";
import dayjs from "dayjs";


const includes = [
    {
        model: Usuarios,
        as: 'propietario',
        attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'iniciales', 'email', 'foto', 'slug', 'leaderId'],
    },
    {
        model: Usuarios,
        as: 'coResponsables',
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

export const getTasks = async (req: Request, res: Response) => {
    const { taskeableId } = req.query as { taskeableId: string};

    try {
        const tasks = await Task.findAll({
            where: {
                taskeableId
            },
            include: includes
        });

        res.json({ tasks });
    } catch (error) {
        console.log(error);

        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const createTask = async (req: Request, res: Response) => {

    const { nombre, taskeableId, quarter, taskeableType } = req.body
    const {id: propietarioId} = req.user as UsuarioInterface

    try {
                         
            const task = await Task.create({
                nombre,
                taskeableId,
                propietarioId: propietarioId,
                fechaFin: dayjs().endOf(quarter).toDate(),
                status: 'SIN_INICIAR',
                prioridad: 'Normal',
                progreso: 0,
                taskeableType: taskeableType 
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
    const { nombre, propietarioId, taskeableId, status, fechaFin, prioridad, progreso, coResponsables, created } = req.body;

    
    const coResponsablesIds = Array.isArray(coResponsables) ? coResponsables.map((coResponsable: any) => coResponsable.id) : coResponsables;


    try {
        const task = await Task.findByPk(id);

        if (!task) {
            return res.status(404).json({
                msg: 'No existe una tarea'
            });
        }
        
        let finalProgreso = progreso;
        let finalStatus = status;


        if( task.progreso !== progreso ){
            if(task.status !== 'SIN_INICIAR' && progreso > 0 && progreso < 100){
                finalProgreso = progreso
                finalStatus = 'EN_PROCESO';
            } else if(task.status === 'EN_PROCESO' && progreso === 0){
                finalProgreso = progreso
                finalStatus = 'SIN_INICIAR';
            } else if(task.status === 'SIN_INICIAR' && progreso > 0 && progreso < 100){
                finalProgreso = progreso
                finalStatus = 'EN_PROCESO';
            } else if(( task.status === 'EN_PROCESO' || task.status === 'SIN_INICIAR' ) && progreso === 100){
                finalProgreso = progreso
                finalStatus = 'FINALIZADO';
            } else if (task.status === 'FINALIZADO' && progreso === 0){
                finalProgreso = progreso
                finalStatus = 'SIN_INICIAR';
            }
        }


        if( task.status !== status ){
            if( task.progreso === 0  && status === 'EN_PROCESO'){
                finalProgreso = 1
                finalStatus = status
            } else if (task.progreso === 100 && status === 'EN_PROCESO'){
                finalProgreso = 99
                finalStatus = status
            } else if ( status === 'FINALIZADO'){
                finalProgreso = 100
                finalStatus = status
            } else if ( status === 'CANCELADO' || status === 'SIN_INICIAR'){
                finalProgreso = 0
                finalStatus = status
            }
        }


        // CoResponsables
        if(coResponsablesIds){
            task.setCoResponsables(coResponsablesIds);
        }

        await task.update({
            nombre,
            propietarioId,
            taskeableId,
            fechaFin,
            progreso: finalProgreso,
            status: finalStatus,
            prioridad,
            created: created ? created : task.created
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