
import { Request, Response } from "express";
import { Hitos, Task, Usuarios } from "../models";
import { HitosProps, UsuarioInterface } from "../interfaces";
import { io } from "../services/socketService";


const userSingleAttr = ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'iniciales', 'foto'];

const getInclues = ({id} : any) => {
    return [
        {
            model: Usuarios,
            attributes: ['id'],
            through: {
                attributes: ['orden'],
            },
            as: 'ordenHito',
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

export const getHitos = async (req: Request, res: Response) => {

    const { id } = req.user as UsuarioInterface;
    const { proyectoId } = req.query;    
    const where: any = {};

    if (proyectoId) {
        where.proyectoId = proyectoId;
    }


    try {
    
        const hitos = await Hitos.findAll({
            where,
            include: getInclues({id})
        });
        
        res.json({ hitos });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const createHito = async (req: Request, res: Response) => {

    const { proyectoId } = req.body as HitosProps;
    const {id} = req.user as UsuarioInterface;
    try {
        const hito = await Hitos.create({proyectoId});

        const tasks = ['Actividad 1', 'Actividad 2'];

        if (tasks) {
            for (const task of tasks) {
                await Task.create({
                    nombre: task,
                    propietarioId: id,
                    taskeableId: hito.id,
                    taskeableType: 'HITO',
                    prioridad: 'MEDIA',
                    status: 'SIN_INICIAR',
                    progreso: 0,
                    fechaFin: new Date()
                });
            }
        }

        await hito.reload({
            include: getInclues({id: hito.id})
        });

        // Obtener array de UsuariosTarea
        res.json({ hito });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }

}

export const updateHito = async (req: Request, res: Response) => {
    
        const { id } = req.params;
        const { titulo, descripcion, fechaInicio, fechaFin, status, proyectoId, color } = req.body as HitosProps;
        try {                      

            const hito = await Hitos.findByPk(id);

            await hito.update({
                titulo: titulo ? titulo : hito.titulo,
                descripcion: descripcion ? descripcion : hito.descripcion,
                fechaInicio: fechaInicio? fechaInicio : hito.fechaInicio,
                fechaFin: fechaFin ? fechaFin : hito.fechaFin,
                status: status ? status : hito.status,
                proyectoId: proyectoId ? proyectoId : hito.proyectoId,
                color: color ? color : hito.color,
            });

            await hito.reload({
                include: getInclues({id})
            });

            // const [usuarioObject] = hito.task?.map((task: any) => task.usuariosTarea)
            // const usuariosTarea = usuarioObject?.map((usuario: any) => usuario.id);
            // io.to(usuariosTarea).emit('hitos:updated', hito);

            res.json({ hito });
    
        } catch (error) {
            console.log(error);
            res.status(500).json({
                msg: 'Hable con el administrador'
            });
        }    
}

export const deleteHito = async (req: Request, res: Response) => {
        
        const { id } = req.params;
        const where: any = { id };
        try {
    
            const hito = await Hitos.destroy({
                where
            });
    
            res.json({ hito });
    
        } catch (error) {
            console.log(error);
            res.status(500).json({
                msg: 'Hable con el administrador'
            });
        }
        
}

export const duplicateHito = async (req: Request, res: Response) => {
    const { hitoId } = req.body

    try {
        const hito = await Hitos.findByPk(hitoId);

        if (!hito) {
            return res.status(404).json({
                msg: 'No existe un hito con el id ' + hitoId
            });
        }
        const tasks = await Task.findAll({
            where: {
                taskeableId: hitoId,
                taskeableType: 'HITO'
            }
        });

        const nuevoHito = await Hitos.create({
            titulo: hito.titulo,
            descripcion: hito.descripcion,
            fechaInicio: hito.fechaInicio,
            fechaFin: hito.fechaFin,
            status: hito.status,
            proyectoId: hito.proyectoId,
            color: hito.color
        });

        for (const task of tasks) {
            await Task.create({
                nombre: task.nombre,
                descripcion: task.descripcion,
                prioridad: task.prioridad,
                propietarioId: task.propietarioId,
                fechaFin: task.fechaFin,
                status: task.status,
                taskeableId: nuevoHito.id,
                taskeableType: 'HITO',
                progreso: task.progreso
            });
        }

        await nuevoHito.reload({
            include: getInclues({id: nuevoHito.id})
        });

        return res.json(nuevoHito);

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}