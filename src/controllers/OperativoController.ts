import { Request, Response } from "express";
import { ObjetivoOperativos, Usuarios, ResultadosClave, PivotOpUsuario } from "../models";
import { UsuarioInterface } from "../interfaces";
import dayjs from "dayjs";
import { Op } from "sequelize";


const includes = [
    {
        model: Usuarios,
        as: 'operativosResponsable',
        attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'iniciales', 'email', 'foto'],
        through: {
            attributes: ['propietario', 'progresoFinal', 'progresoAsignado', 'progresoReal'],
            as: 'scoreCard'
        },
        required: false
    },
    {
        model: ResultadosClave,
        as: 'resultadosClave',
        attributes: ['id', 'nombre', 'progreso', 'tipoProgreso', 'fechaInicio', 'fechaFin', 'operativoId', 'status'],
        required: false
    }
]


export const getOperativos = async (req:any, res: Response) => {
    
    const { year, quarter, usuarioId } = req.query;

    try {
        const operativos = await ObjetivoOperativos.findAll({
            order: [['createdAt', 'ASC']],
            include: includes,
            where: {
                [Op.and]: [
                    {
                        year
                    },
                    {
                        quarter
                    }
                ]
            }
        });
      
        const filteredObjetivos = filtrarObjetivosUsuario(operativos, usuarioId)

        res.json({ operativos: filteredObjetivos });
    
    } catch (error) {
        console.log(error);
        
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const updateOperativo = async (req: Request, res: Response) => {
    const { id } = req.params;

    const { nombre, meta, indicador, fechaInicio, fechaFin, operativosResponsable = [] , propietarioId = '', tacticoId, progresoAsignado } = req.body;
    const { id: userId } = req.user as UsuarioInterface

    const fechaInicial = dayjs(fechaInicio).toDate();
    const fechaFinal = dayjs(fechaFin).toDate();

    try {
        const operativo = await ObjetivoOperativos.findByPk(id);
        if (!operativo) {
            return res.status(404).json({
                msg: `No existe un operativo`
            });
        }

        await operativo.update({
            nombre,
            meta,
            indicador,
            fechaInicio: fechaInicial,
            fechaFin: fechaFinal,
            tacticoId,
            propietarioId,
        });


        // @ts-ignore
        await operativo.setOperativosResponsable(operativosResponsable);    
        await operativo.reload( { include: includes } );

        const operativoCreado = await PivotOpUsuario.findOne({
            where: {
                objetivoOperativoId: operativo.id,
                responsableId: userId
            }
        });
        if (operativoCreado) {
            await operativoCreado.update({
                progresoAsignado: progresoAsignado as number
            });
        }
       

        res.json({operativo});
    
    } catch (error) {
        console.log(error);
        
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const createOperativo = async (req: Request, res: Response) => {
    
    const { nombre, meta, indicador, fechaInicio, fechaFin, operativosResponsable = [], tacticoId, progresoAsignado, quarter, year} = req.body;
    const { id } = req.user as UsuarioInterface

    const fechaInicial = dayjs(fechaInicio).toDate();
    const fechaFinal = dayjs(fechaFin).toDate();

    try {

        const operativo = await ObjetivoOperativos.create({
            nombre,
            meta,
            indicador,
            fechaInicio: fechaInicial,
            fechaFin: fechaFinal,
            tacticoId,
            propietarioId: id,
            quarter,
            year
        });

        
        // @ts-ignore
        await operativo.setOperativosResponsable([...operativosResponsable, id]);
        await operativo.reload( { include: includes });

        console.log(operativo);
        

        const operativoCreado = await PivotOpUsuario.findOne({
            where: {
                objetivoOperativoId: operativo.id,
                usuarioId: id
            }
        });

        if (operativoCreado) {
            await operativoCreado.update({
                progresoAsignado
            });
        }

           
        res.json({operativo});
    
    } catch (error) {
        console.log(error);
        
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const deleteOperativo = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const operativo = await ObjetivoOperativos.findByPk(id);
        if (!operativo) {
            return res.status(404).json({
                msg: `No existe un operativo con el id ${id}`
            });
        }

        await operativo.destroy();

        res.json(operativo);
    
    } catch (error) {
        console.log(error);
        
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const getOperativo = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const operativo = await ObjetivoOperativos.findByPk(id, {
            include: includes
        });
        if (!operativo) {
            return res.status(404).json({
                msg: `No existe un operativo con el id ${id}`
            });
        }

        res.json({operativo});
    
    } catch (error) {
        console.log(error);
        
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}


const filtrarObjetivosUsuario = (objetivos: any[], id: string) => {
    const objetivo = objetivos.filter( (obj: any) => obj.operativosResponsable.some( (res: any) => res.id === id));
    return objetivo;
}