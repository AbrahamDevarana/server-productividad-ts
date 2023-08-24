
import { Request, Response } from "express";
import { Hitos, Tareas, Usuarios } from "../models";
import { HitosProps, UsuarioInterface } from "../interfaces";
import { io } from "../services/socketService";


const userSingleAttr = ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'iniciales', 'foto'];

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
        include: [{
                model: Usuarios,
                attributes: ['id'],
                through: {
                    attributes: ['orden'],
                },
                as: 'ordenHito',
                where: { id },
            }, {
                model: Tareas,
                as: 'tareas',
                include: [{
                    model: Usuarios,
                    attributes : userSingleAttr,
                    as: 'usuariosTarea',
                    through: {
                        attributes: []
                    },
                },
                {
                    model: Usuarios,
                    attributes : userSingleAttr,
                    as: 'propietario',
                }]
            }]
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

    try {
        const hito = await Hitos.create({proyectoId});

        await hito.reload({
            include: [{
                model: Usuarios,
                attributes: ['id'],
                through: {
                    attributes: ['orden'],
                },
                as: 'ordenHito',
            }, {
                model: Tareas,
                as: 'tareas',
                include: [{
                    model: Usuarios,
                    attributes: userSingleAttr,
                    as: 'usuariosTarea',
                    through: {
                        attributes: []
                    },
                },
                {
                    model: Usuarios,
                    attributes: userSingleAttr,
                    as: 'propietario',
                }]
            }]
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
        const { titulo, descripcion, fechaInicio, fechaFin, status, proyectoId } = req.body as HitosProps;
       

        // const where = { id };
        try {                      

            const hito = await Hitos.findByPk(id);

            await hito.update({
                titulo,
                descripcion,
                fechaInicio,
                fechaFin,
                status,
                proyectoId,
            });

            await hito.reload({
                include: [{
                    model: Usuarios,
                    attributes: ['id'],
                    through: {
                        attributes: ['orden'],
                    },
                    as: 'ordenHito',
                }, {
                    model: Tareas,
                    as: 'tareas',
                    include: [{
                        model: Usuarios,
                        attributes: userSingleAttr,
                        as: 'usuariosTarea',
                        through: {
                            attributes: []
                        },
                    },
                    {
                        model: Usuarios,
                        attributes: userSingleAttr,
                        as: 'propietario',
                    }]
                }]
            });

            const [usuarioObject] = hito.tareas.map((tarea: any) => tarea.usuariosTarea)
            const usuariosTarea = usuarioObject.map((usuario: any) => usuario.id);
            io.to(usuariosTarea).emit('hitos:updated', hito);

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