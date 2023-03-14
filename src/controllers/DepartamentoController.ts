import { Request, Response } from "express";
import { Op } from "sequelize";
import { getPagination, getPagingData } from "../helpers/pagination";
import { Departamentos } from "../models/Departamentos";


export const getDepartamentos = async (req: Request, res: Response) => {
    const { nombre, areaId, page = 0, size = 10 } = req.query;
    const { limit, offset } = getPagination(Number(page), Number(size));

    const where: any = {};

    console.log(nombre, areaId);
    

    nombre && (where.nombre = { [Op.like]: `%${nombre}%` });
    areaId && (where.areaId = areaId);

    try {
        const result = await Departamentos.findAndCountAll({
            include: ['area'],
            where,
            limit,
            offset
        })

        const departamentos = getPagingData(result, Number(page), Number(size));
    
        console.log(departamentos.rows);
        
        res.json({ departamentos });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}


export const getDepartamento = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const departamento = await Departamentos.findByPk(id, {
            include: ['area']
        });

        if (departamento) {
            res.json({ departamento });
        } else {
            res.status(404).json({
                msg: `No existe un departamento con el id ${id}`
            });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const createDepartamento = async (req: Request, res: Response) => {
    const { nombre, areaId } = req.body;

    try {
        const departamento = await Departamentos.create({ nombre, areaId });

        res.json({
            departamento
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const updateDepartamento = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { nombre, areaId } = req.body;

    try {
        const departamento = await Departamentos.findByPk(id, {
            include: ['area']
        });

        if (departamento) {
            await departamento.update({ nombre, areaId });
            res.json({ departamento });
        } else {
            res.status(404).json({
                msg: `No existe un departamento con el id ${id}`
            });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const deleteDepartamento = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const departamento = await Departamentos.findByPk(id);

        if (departamento) {
            await departamento.destroy();
            res.json({ departamento });
        } else {
            res.status(404).json({
                msg: `No existe un departamento con el id ${id}`
            });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}
