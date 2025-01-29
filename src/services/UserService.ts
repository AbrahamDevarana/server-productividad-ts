import { literal, Op, Sequelize, WhereOptions } from "sequelize";
import { Departamentos, Rendimiento, Usuarios } from "../models";
import { updateRendimiento } from "../helpers/updateRendimiento";
import { getBono } from "../helpers/getBono";

export const getUser = async ({ id, isSingle }: { id: string, isSingle?: boolean }) => {
    return await Usuarios.findByPk(id,
        { 
            // include: [{model: Departamentos, as: 'departamento', include: ['area']}, 'direccion'],
            include: [...( isSingle ? [] : [{model: Departamentos, as: 'departamento', include: ['area']}, 'direccion'])],
        }
    );
}

export const getUsuariosService =  async ( {search, status} : {search: string, status: string}) => {
    let whereClause: WhereOptions = {}

    if(search) {
        whereClause = {
            [Op.or]: [
                literal('usuarios.nombre LIKE :search'),
                literal('usuarios.apellidoPaterno LIKE :search'),
                literal('usuarios.apellidoMaterno LIKE :search'),
                literal('usuarios.email LIKE :search'),
            ],
        }
    }

    if(status === 'ACTIVO' || status === 'INACTIVO') {
        whereClause = {
            ...whereClause,
            status
        }
    }
    
    return await Usuarios.findAll({
        include: [{model: Departamentos, as: 'departamento', include: ['area']}, 'direccion'],
            order: [
                ['nombre', 'ASC']
        ],
        where: whereClause,
        replacements: {
            search: `%${search}%`
        }
    })
}


export const getUsuariosRendimientoService = async ({ year, quarter, search, status, statusUsuario }: {year: number, quarter: number, search: string, status: string, statusUsuario: string}) => {
    let where = {}
        
        let statusUsuarios = statusUsuario === '' ? ['ACTIVO', 'INACTIVO'] : [statusUsuario]
    
        if (search) {
            where = {
                [Op.or]: [
                    literal('CONCAT(nombre, " ", apellidoPaterno) LIKE :search'),
                    literal('CONCAT(nombre, " ", apellidoMaterno) LIKE :search'),
                    literal('CONCAT(nombre, " ", apellidoPaterno, " ", apellidoMaterno) LIKE :search'),
                    literal('nombre LIKE :search'),
                    literal('apellidoPaterno LIKE :search'),
                    literal('apellidoMaterno LIKE :search'),
                ],
            }
        }
    
        try {
            const usuarios = await Usuarios.findAll({
                attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'iniciales', 'email', 'foto', 'slug', 'leaderId', 'status'],
                include: [{
                    model: Rendimiento,
                    as: 'rendimiento',
                    where: {
                        [Op.and]: [
                            { year },
                            { quarter },
                            status ? { status } : {}
                        ]
                    },
                    attributes: [
                        'resultadoObjetivos', 
                        'resultadoCompetencias', 
                        'resultadoFinal', 
                        'status',
                        [Sequelize.literal('(SELECT COUNT(*) FROM pivot_objetivo_rendimiento WHERE pivot_objetivo_rendimiento.rendimientoId = rendimiento.id)'), 'rendimientoOperativoCount']
                    ],
                }, {
                    model: Departamentos,
                    as: 'departamento',
                    include: ['area']
                }],
                where: {
                    [Op.and]: [
                        { status: statusUsuarios },
                        where
                    ],
                },
                replacements: {
                    search: `%${search}%`
                },
                order: [
                    ['nombre', 'ASC']
                ]
            })
    
            usuarios.map( async usuario => {
                await updateRendimiento({year, quarter, usuarioId: usuario.id})
            })
            
            const usuariosRendimiento = usuarios.map( (usuario: any) => {
                 
                const { rendimiento } = usuario            
    
                const { resultadoObjetivos, resultadoCompetencias, resultadoFinal, status } = rendimiento[0]
                const rendimientoOperativoCount = rendimiento[0].getDataValue('rendimientoOperativoCount');
    
                return {
                    id: usuario.id,
                    area: usuario.departamento.area.nombre,
                    departamento: usuario.departamento.nombre,
                    nombre: usuario.nombre,
                    apellidoPaterno: usuario.apellidoPaterno,
                    apellidoMaterno: usuario.apellidoMaterno,
                    iniciales: usuario.iniciales,
                    email: usuario.email,
                    foto: usuario.foto,
                    slug: usuario.slug,
                    leaderId: usuario.leaderId,
                    rendimiento: {
                        countObjetivos: rendimientoOperativoCount,
                        resultadoObjetivos,
                        resultadoCompetencias,
                        resultadoFinal,
                        bono: getBono(resultadoFinal),
                        status
                    }
                }
            })
            return usuariosRendimiento
        } catch (error) {
            throw error
        }
}