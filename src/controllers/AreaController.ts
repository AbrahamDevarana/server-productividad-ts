import { Request, Response } from "express";
import { Op } from "sequelize";
import { Areas } from "../models/Areas";
import { getPagination, getPagingData } from "../helpers/pagination";
import { Departamentos, Perspectivas, Usuarios } from "../models";


const areaInclude = [
    {
        model: Areas,
        as: 'subAreas',
    },
    {
        model: Departamentos,
        as: 'departamentos',
        include: [
            {
                model: Usuarios,
                as: 'usuario',
                attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'iniciales', 'email', 'foto', 'slug'],
                where: { status: 'ACTIVO' }
            },
            {
                model: Usuarios,
                as: 'leader',
                attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'iniciales', 'email', 'foto', 'slug'],
                where: { status: 'ACTIVO' }
            }
        ],
        
    },
    {
        model: Usuarios,
        as: 'leader',
        attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'iniciales', 'email', 'foto', 'slug'],
        where: { status: 'ACTIVO' }
    },
    {
        model: Perspectivas,
        as: 'perspectivas',
    }
]

export const getAreas = async (req: Request, res: Response) => {
        const { page = 0, size = 10, nombre } = req.query;
        const { limit, offset } = getPagination(Number(page), Number(size));
        const where: any = {};
        nombre && (where.nombre = { [Op.like]: `%${nombre}%` });

        try {
            const result = await Areas.findAndCountAll({ 
                where,
                include: areaInclude,
                limit,
                offset,
                order: [['order', 'ASC']]
            });

            const areas = getPagingData (result, Number(page), Number(size));
            res.json({ areas });
            
        } catch (error) {
            console.log(error);
            res.status(500).json({
                msg: 'Hable con el administrador'
            });
        }
}

export const getArea = async (req: Request, res: Response) => {
            
    const { id } = req.params;
    

    try {
        const area = await Areas.findOne({
            where: { [Op.or]: [{ id }, { slug: id }] },
            include: areaInclude,
            // ordenar por departamentos
            order: [
                [{ model: Departamentos, as: 'departamentos' }, 'order', 'ASC'],
            ]
        });

        if (area) {

            res.json({ area });
        } else {
            res.status(404).json({
                msg: `No existe la área seleccionada`
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const createArea = async (req: Request, res: Response) => {

    const { nombre, parentId = null, leaderId = null} = req.body;

    try {
        const area = await Areas.create({ nombre, parentId, leaderId});

        area.reload({ include: areaInclude });
        res.json({ area });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const updateArea = async (req: Request, res: Response) => {
    
    const { id } = req.params;
    const { nombre, parentId = null, leaderId = null } = req.body;    

    try {
        const area = await Areas.findByPk(id);
        if (area) {
            await area.update({ nombre, parentId, leaderId })
            await area.reload({ include: areaInclude })
            res.json({ area });
        } else {
            res.status(404).json({
                msg: `No existe la área seleccionada`
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const deleteArea = async (req: Request, res: Response) => {
        
    const { id } = req.params;

    try {
        const area = await Areas.findByPk(id);
        if (area) {
            await area.destroy();
            res.json({ area });
        } else {
            res.status(404).json({
                msg: `No existe la área seleccionada`
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const getAreaObjetivos = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const area = await Areas.findByPk(id, {
            include: [
                {
                    model: Departamentos,
                    as: 'departamentos',
                    include: [
                        {
                            model: Usuarios,
                            as: 'usuarios',
                            attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'iniciales', 'email', 'foto', 'slug'],
                        }
                    ]
                },
                {
                    model: Usuarios,
                    as: 'leader',
                }
            ]
        });

       res.json({ area });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}