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
        as: 'usuario',
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
            distinct: true,
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
    const { nombre, areaId, leaderId = null, color } = req.body;

    try {
        const departamento = await Departamentos.create({ nombre, areaId, leaderId, color });


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
    const { nombre, areaId, leaderId, color } = req.body;
    try {
        const departamento = await Departamentos.findByPk(id);

        if (departamento) {
            await departamento.update({ 
                nombre: nombre? nombre : departamento.nombre,
                areaId: areaId? areaId : departamento.areaId,
                leaderId: leaderId? leaderId : departamento.leaderId,
                color: color ? color : departamento.color,
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
                    attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'email', 'foto', 'slug'],
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

export const getUsuariosByDepartamento = async (req: Request, res: Response) => {
    const { id } = req.params;
    
    try {

        // obtenerDepartamento del usuario

       const usuario = await Usuarios.findOne({
              where: { id },
                include: [
                    { model: Departamentos, as: 'departamento', attributes: ['id', 'nombre', 'areaId'] },
                    ],
            });

        if (!usuario) {
            return res.status(404).json({
                msg: `No existe un ese usuario`
            });
        }
        // obtener usuarios del departamento


        const departamento = await Departamentos.findOne({
            where: { id: usuario.departamento.id },
            include: [
                { model: Usuarios, as: 'usuario', attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno'] },
              ],
        });
            
        res.json({ departamento });         
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}