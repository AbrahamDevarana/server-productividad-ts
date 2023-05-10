import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";
import { Proyectos, Hitos, Usuarios, Tareas, PivotProyectoUsuarios, UsuarioHitosOrden } from "../models";
import { ProyectosProps, UsuarioInterface } from "../interfaces";


export const getProyectos = async (req: Request, res: Response) => {
    
    const {} = req.body;
    const { id } = req.user as UsuarioInterface
    const where: any = {};


    where[Op.or] = [
        { propietarioId: id },
        { '$usuariosProyecto.id$': id }
    ];


    try {

        const proyectos = await Proyectos.findAll({
            where,
            include: [{
                model: Usuarios,
                as: 'usuariosProyecto',
                through: {
                    attributes: []
                },
                attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
            }],
        });               

        res.json({ proyectos });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const getProyecto = async (req: Request, res: Response) => {
        
        const { id } = req.params;
        const where: any = { id };
    
        try {
    
            const proyecto = await Proyectos.findOne({
                where,
                include: [{   
                    model: Usuarios,
                    as: 'usuariosProyecto',
                    attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'iniciales', 'foto'],
                }],
            });       

            res.json({ proyecto });
    
        } catch (error) {
            console.log(error);
            res.status(500).json({
                msg: 'Hable con el administrador'
            });
        }
}

export const createProyecto = async (req: Request, res: Response) => {
        
    const { titulo, descripcion, icono, imagen, fechaInicio, fechaFin, status, participantes} = req.body as ProyectosProps;
    const { id } = req.user as UsuarioInterface

    console.log(participantes);
    
    try {
        const proyecto = await Proyectos.create({
            titulo,
            descripcion,
            fechaInicio,
            fechaFin,
            status,
            propietarioId: id,   

            icono,
            imagen,
        });               

        await proyecto.addUsuariosProyecto(participantes);
        await proyecto.reload('usuariosProyecto');

        res.json({ proyecto });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const updateProyecto = async (req: Request, res: Response) => {
            
        const { id } = req.params;
        const { titulo, descripcion, icono, imagen, fechaInicio, fechaFin, status } = req.body;

        console.log(req.body);
        
        const where: any = { id };
        try {
    
            const proyecto = await Proyectos.findOne({
                where,
            });       
    
            if (!proyecto) {
                return res.status(404).json({
                    msg: `No existe un proyecto con el id ${id}`
                });
            }
    
            await proyecto.update({
                titulo,
                descripcion,
                icono,
                imagen,
                fechaInicio,
                fechaFin,
                status,
            });

            await proyecto.reload('proyectosHito');
            
            console.log(proyecto);
            
            res.json({ proyecto });
    
        } catch (error) {
            console.log(error);
            res.status(500).json({
                msg: 'Hable con el administrador'
            });
        }
    }


