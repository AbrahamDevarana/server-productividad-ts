import { Request, Response } from 'express'
import { Comentarios, Departamentos, ObjetivoEstrategico, Perspectivas, Core, Usuarios } from '../models'
import { Op } from 'sequelize'
import dayjs from 'dayjs'
import { UsuarioInterface } from '../interfaces'
import { getStatusAndProgress } from '../helpers/getStatusAndProgress'


const includes = [
    {
        model: Departamentos,
        as: 'departamentos',
        through: { attributes: [] },
        attributes: ['id', 'nombre']
    },
    {
        model: Usuarios,
        as: 'responsables',
        attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'email', 'foto'],
        through: {
            attributes: []
        },
    },
    {
        model: Usuarios,
        as: 'propietario',
        attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'email', 'foto'],
    },
    {
        model: ObjetivoEstrategico,
        as: 'estrategico',
        include: [{
            model: Perspectivas,
            as: 'perspectivas',
            attributes: ['id', 'nombre',  'color']
        }]

    },
    {
        model: Comentarios,
        as: 'comentarios',
        attributes: ['id', 'mensaje', 'createdAt'],
        include: [
            {
                as: 'autor',
                model: Usuarios,
                attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'iniciales', 'email', 'foto', 'slug'],
            }
        ]
    },
]



export const getCore = async (req: Request, res: Response) => {
    const { id } = req.params
   
    try {
        
        const core = await Core.findOne({
            where: { id },
            include: includes
        })

        if (!core) return res.status(404).json({ msg: 'No se encontró el core' })

        return res.status(200).json({ objetivoCore: core })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: 'Error en el servidor' })
    }
}

export const getCores = async (req: Request, res: Response) => {
    const { year } = req.query

    const fechaInicio = dayjs(`${year}-01-01`).startOf('year').toDate();
    const fechaFin = dayjs(`${year}-12-31`).endOf('year').toDate();

    const where = {
        [Op.or]: [
            {
                fechaInicio: {
                    [Op.between]: [fechaInicio, fechaFin]
                }
            },
            {
                fechaFin: {
                    [Op.between]: [fechaInicio, fechaFin]
                }
            }
        ]
    };
   
    try {
        
        const tacticosCore = await Core.findAll({
            include: includes,
            where
        })

        if (!tacticosCore) return res.status(404).json({ msg: 'No se encontraron cores' })

        return res.status(200).json({ objetivosCore: tacticosCore })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: 'Error en el servidor' })
    }
}

export const createCore = async (req: Request, res: Response) => {
    const { year } = req.body
    const { id: idUsuario } = req.user as UsuarioInterface

    try {
      
        const core = await Core.create({
            propietarioId: idUsuario,
            codigo: '',
            nombre: 'Nuevo Objetivo Core',
            fechaInicio: dayjs(`${year}-01-01`).startOf('year').toDate(),
            fechaFin: dayjs(`${year}-12-31`).endOf('year').toDate(),
        })


        // TODO: Actualizar Código
        
        
        // TODO: Actualizar Código

        await core.reload({
            include: includes
        })

        return res.status(201).json({ objetivoCore: core })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: 'Error en el servidor' })
    }
}

export const updateCore = async (req: Request, res: Response) => {
    const { id } = req.params
    const { nombre, codigo, meta, indicador, fechaInicio, fechaFin, tipoProgreso, status, progreso, responsables, propietarioId } = req.body


    const participantes = responsables.map((responsable: any) => {
        if (typeof responsable === 'object') {
            return responsable.id;
        } else {
            return responsable;
        }
    });

    try {
        
        const core = await Core.findOne({
            where: { id }
        })

        if (!core) return res.status(404).json({ msg: 'No se encontró el core' })

        const { progresoFinal, statusFinal } = getStatusAndProgress({progreso, status, objetivo: core});

        await core.update({
            nombre,
            codigo,
            meta,
            indicador,
            fechaInicio,
            fechaFin,
            tipoProgreso,
            status: statusFinal,
            progreso: progresoFinal
        })

        return res.status(200).json({ objetivoCore: core })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: 'Error en el servidor' })
    }

}

export const deleteCore = async (req: Request, res: Response) => {

    const { id } = req.params

    try {
        
        const core = await Core.findOne({
            where: { id }
        })

        if (!core) return res.status(404).json({ msg: 'No se encontró el core' })

        await core.destroy()

        return res.status(200).json({ msg: 'Core eliminado' })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: 'Error en el servidor' })
    }
}