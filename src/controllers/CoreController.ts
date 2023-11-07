import { Request, Response } from 'express'
import { Comentarios, Departamentos, ObjetivoEstrategico, Perspectivas, Core, Usuarios, Areas } from '../models'
import { Op } from 'sequelize'
import dayjs from 'dayjs'
import { UsuarioInterface } from '../interfaces'
import { getStatusAndProgress } from '../helpers/getStatusAndProgress'


const includes = [
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
    const { year, departamentoId } = req.query as any

    const fechaInicio = dayjs().year(Number(year)).startOf('year').toDate();
    const fechaFin = dayjs().year(Number(year)).endOf('year').toDate();
       
    try {

        const departamento = await Departamentos.findOne({ where: { [Op.or]: [{ id: departamentoId }, { slug: departamentoId }] } })
        const participantes = await departamento?.getUsuario()
        const lider = await departamento?.getLeader()
        const participantesIds = participantes?.map((participante: any) => participante.id);

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
            ],
            [Op.and]: [
                {
                    [Op.or]: [
                        {'$propietario.id$': [...participantesIds, lider?.id]},
                        {'$responsables.id$': [...participantesIds, lider?.id]},
                        // [Op.and, {'$responsables.id$': participantesIds}, {'$propietario.id$': lider.id}]
                    ]
                }
            ]
        };
        
        const tacticosCore = await Core.findAll({
            include: [
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
                }
            ],
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
    const { year, slug } = req.body
    const { id: idUsuario } = req.user as UsuarioInterface

    try {

        const usuario = await Usuarios.findOne({ where: { id: idUsuario } })
      
        const core = await Core.create({
            propietarioId: idUsuario,
            codigo: '',
            nombre: 'Nuevo Objetivo Core',
            fechaInicio: dayjs(`${year}-01-01`).startOf('year').toDate(),
            fechaFin: dayjs(`${year}-12-31`).endOf('year').toDate(),
            departamentoId: usuario?.departamentoId,
        })


        
        await updateCode({id: core.id});
        
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
    const { nombre, codigo, meta, indicador, proyeccion, tipoProgreso, status, progreso, responsables, propietarioId } = req.body


    const fechaInicio = dayjs(proyeccion[0]).startOf('quarter').toDate();
    const fechaFin = dayjs(proyeccion[1]).endOf('quarter').toDate();

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

        const usuario = await Usuarios.findOne({ where: { id: propietarioId } })

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
            progreso: progresoFinal,
            propietarioId,
            departamentoId: usuario?.departamentoId
        })

        await core.setResponsables(participantes)

        await core.reload({
            include: includes
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

export const updateCode = async ({id}: {id:string }) => {
    const objetivoTactico = await Core.findByPk(id);
    const usuario = await Usuarios.findOne({where: {id: objetivoTactico?.propietarioId}});
    const departamento = await Departamentos.findOne({
        where: {id: usuario?.departamentoId},
        include: [
            {
                model: Areas,
                as: 'area',
                attributes: ['codigo']
            }
        ]
    });
    
    const totalObjetivosOperativos = await Core.count({
        where: {
            departamentoId: departamento?.id
        }
    });
    
    const codigo = `${departamento?.area.codigo}-OTC-${totalObjetivosOperativos}`;
    await objetivoTactico.update({codigo});    
}

export const migrateCoreToTactico = async (req: Request, res: Response) => {

}