import { Request, Response } from "express";
import { CategoriaProyectos } from "../models/CategoriaProyecto";
import { UsuarioInterface } from "../interfaces";
import { Proyectos } from "../models";

export const getCategoriasProyecto = async (req: Request, res: Response) => {
    try {
        const categorias = await CategoriaProyectos.findAll({
            where: {
                propietarioId: (req.user as UsuarioInterface).id
            }
        });

        res.json({categorias});
    } catch (error) {
        res.status(500).json({error});
    }
}

export const getCategoriaProyecto = async (req: Request, res: Response) => {
    try {
        const categoria = await CategoriaProyectos.findOne({
            where: {
                id: req.params.id,
                propietarioId: (req.user as UsuarioInterface).id
            }
        });

        res.json({categoria});
    } catch (error) {
        res.status(500).json({error});
    }
}

export const createCategoriaProyecto = async (req: Request, res: Response) => {
    try {
        const categoria = await CategoriaProyectos.create({
            propietarioId: (req.user as UsuarioInterface).id,
            nombre: req.body.nombre,
            orden: req.body.orden
        });

        res.json({categoria});
    } catch (error) {
        res.status(500).json({error});
    }
}

export const updateCategoriaProyecto = async (req: Request, res: Response) => {
    try {
        const categoria = await CategoriaProyectos.update({
            nombre: req.body.nombre,
            orden: req.body.orden
        }, {
            where: {
                id: req.params.id,
                propietarioId: (req.user as UsuarioInterface).id
            }
        });

        res.json({categoria});
    } catch (error) {
        res.status(500).json({error});
    }
}

export const deleteCategoriaProyecto = async (req: Request, res: Response) => {
    try {
        const categoria = await CategoriaProyectos.destroy({
            where: {
                id: req.params.id,
                propietarioId: (req.user as UsuarioInterface).id
            }
        });

        res.json({categoria});
    } catch (error) {
        res.status(500).json({error});
    }
}


export const addProyectoToCategoria = async (req: Request, res: Response) => {        

    const { proyectoId, categoriaId } = req.body;

    try {
        const categoria = await CategoriaProyectos.findByPk(categoriaId);

        if(!categoria) {
            return res.status(404).json({error: 'Categoria no encontrada'});
        }

        const proyecto = await Proyectos.findByPk(proyectoId);

        if(!proyecto) {
            return res.status(404).json({error: 'Proyecto no encontrado'});
        }

        const categoriasActuales = await proyecto.getCategorias();

        for(const categoriaActual of categoriasActuales) {
            await proyecto.removeCategoria(categoriaActual);
        }
        
        // @ts-ignore
        await proyecto.addCategoria(categoria);
        
        res.json({proyecto});
        
    } catch (error) {
        res.status(500).json({error});
    }
}
