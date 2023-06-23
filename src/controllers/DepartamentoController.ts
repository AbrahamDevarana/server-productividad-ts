import { Request, Response } from "express";
import { Op } from "sequelize";
import { getPagination, getPagingData } from "../helpers/pagination";
import { Usuarios, Departamentos, Areas } from "../models";



const departamentoInclude = [ 
    {
        model: Areas,
        as: 'area',
    },
    {
        model: Usuarios,
        as: 'leader',
    },
    {
        model: Usuarios,
        as: 'usuarios',
    }
]

export const getDepartamentos = async (req: Request, res: Response) => {
    const { nombre, areaId, page = 0, size = 10 } = req.query;
    const { limit, offset } = getPagination(Number(page), Number(size));

    const where: any = {};

    nombre && (where.nombre = { [Op.like]: `%${nombre}%` });
    areaId && (where.areaId = areaId);

    try {
        const result = await Departamentos.findAndCountAll({
            include: departamentoInclude,
            where,
            limit,
            offset
        })

        const departamentos = getPagingData(result, Number(page), Number(size));
        
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
        const departamento = await Departamentos.findByPk(id, { include: departamentoInclude });

        if (departamento) {
            res.json({ departamento });
        } else {
            res.status(404).json({
                msg: `No existe un ese departamento`
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
    const { nombre, areaId, leaderId = null } = req.body;

    try {
        const departamento = await Departamentos.create({ nombre, areaId, leaderId });


        departamento.reload({ include: departamentoInclude })

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
    const { nombre, areaId, leaderId } = req.body;

    try {
        const departamento = await Departamentos.findByPk(id);

        if (departamento) {
            await departamento.update({ 
                nombre: nombre? nombre : departamento.nombre,
                areaId: areaId? areaId : departamento.areaId,
                leaderId: leaderId? leaderId : departamento.leaderId
            });
            await departamento.reload({ include: departamentoInclude })
            res.json({ departamento });
        } else {
            res.status(404).json({
                msg: `No existe un ese departamento`
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
                msg: `No existe un ese departamento`
            });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const getLideresByDepartamento = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {

        const departamento = await Departamentos.findOne({
            where: { id },
            include: [
                { model: Areas, as: 'area', include: [{ model: Usuarios, as: 'leader', 
                    attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno']
                }] },
                { model: Usuarios, as: 'leader', attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno'] },
              ],
        });

        if (departamento) {
            const lideres = departamento.area.leader ? [departamento.area.leader] : [];
            if (departamento.leader) {
                lideres.push(departamento.leader);
            }
            res.json({ lideres });
            
        } else {
            res.status(404).json({
                msg: `No existe un ese departamento`
            });
        }           
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}