import { Areas, ObjetivoEstrategico, Tacticos, Usuarios } from '../models'
import { Request, Response } from 'express'
import { Op } from 'sequelize'

export const getTacticos = async (req: Request, res: Response) => {
    const {nombre, codigo, fechaInicio, fechaFin, tipoObjetivo, status, order} = req.query;
    const where: any = {};
    const whereResponsable: any = {};
    const whereArea: any = {};

    nombre && (where.nombre = { [Op.like]: `%${nombre}%` });
    codigo && (where.codigo = { [Op.like]: `%${codigo}%` });
    fechaInicio && (where.fechaInicio = { [Op.gte]: fechaInicio });
    fechaFin && (where.fechaFin = { [Op.lte]: fechaFin });
    tipoObjetivo && (where.tipoObjetivo = tipoObjetivo);
    status && (where.status = status);

    try {

        const tacticos = await Tacticos.findAll({
            where,
            include: [{
                model: Usuarios,
                as: 'responsables',
                through: { attributes: [] },
                where: whereResponsable,
            },{
                model: Areas,
                as: 'areas',
                through: { attributes: [] },
                where: whereArea,
                attributes: ['id', 'nombre']
            }
        ]
        });

        res.json({ tacticos });           

        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }

}

export const getTactico = async (req: Request, res: Response) => {
    const { id } = req.params;    
    try {
        const tactico = await Tacticos.findByPk(id, { include: ['responsables', 'areas'] });
        if (tactico) {

            res.json({
                tactico
            });
        } else {
            res.status(404).json({
                msg: `No existe un objetivo tactico con el id ${id}`
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const createTactico = async (req: Request, res: Response) => {
    const { nombre, codigo, descripcion, fechaInicio, fechaFin, tipoObjetivo, status, responsables = [], areas = [], estrategicoId } = req.body;
    
    try {
        const tactico = await Tacticos.create({ nombre, codigo, descripcion, fechaInicio, fechaFin, tipoObjetivo, status });
        
        
        await tactico.setResponsables(responsables);
        await tactico.setAreas(areas);
        await tactico.setObjetivo_tact(estrategicoId);
        

        await tactico.reload({ include: ['responsables', 'areas'] });

        res.json({
            tactico
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const updateTactico = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { nombre, codigo, descripcion, fechaInicio, fechaFin, tipoObjetivo, status, responsable } = req.body;

    try {
        const tactico = await Tacticos.findByPk(id);
        if (tactico) {
            await tactico.update({ nombre, codigo, descripcion, fechaInicio, fechaFin, tipoObjetivo, status, responsable });
            res.json({
                tactico
            });
        } else {
            res.status(404).json({
                msg: `No existe un objetivo tactico con el id ${id}`
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const deleteTactico = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const tactico = await Tacticos.findByPk(id);
        if (tactico) {
            await tactico.destroy();
            res.json({
                tactico
            });
        } else {
            res.status(404).json({
                msg: `No existe un objetivo tactico con el id ${id}`
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}


export const getTacticosByArea = async (req: Request, res: Response) => {
    const { slug } = req.params;
    try {
        const tacticos = await Tacticos.findAll({
            include: [
                {
                    model: Areas,
                    as: 'areas',
                    through: { attributes: [] },
                    where: { slug }
                },
                {
                    model: Usuarios,
                    as: 'responsables',
                    through: { attributes: [] },
                },
            ]
        });
        res.json({ tacticos });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const getTacticosByEstrategia = async (req: Request, res: Response) => {
    const { estrategiaId } = req.params;
    
    try {
        const tacticos = await Tacticos.findAll({
            include: [
                {
                    model: ObjetivoEstrategico,
                    as: 'objetivo_tact',
                    through: { attributes: [] },
                    where: { id: estrategiaId }
                },
                {
                    model: Usuarios,
                    as: 'responsables',
                    through: { attributes: [] },
                },
            ]
        });
        res.json({ tacticos });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

