import { Request, Response } from 'express'
import { Usuarios, Rendimiento} from '../models'
import ExcelJS from 'exceljs'
import { Op, Sequelize, literal } from 'sequelize'
import { updateRendimiento } from '../helpers/updateRendimiento'

const VALOR_OBJETIVOS = 90
const VALOR_COMPETENCIAS = 10


export const obtenerRendimiento = async (req: Request, res: Response) => {
    
    const { year, quarter, search, status } = req.query

    if( !year || !quarter ) {
        return res.status(400).json({
            msg: 'Los campos year y quarter son obligatorios'
        })
    }

    await obtenerUsuarios({year, quarter, search, status}).then( (usuarios) => {
    
        return res.json({usuarios})
    }).catch( (error) => {
        return res.status(500).json({
            msg: 'Error al obtener los usuarios',
            error
        })
    })  
}

export const generarReporteRendimiento = async (req: Request, res: Response) => {

    const { year, quarter, search, status } = req.query


    console.log(year, quarter, search, status);
    

    if( !year || !quarter ) {
        return res.status(400).json({
            msg: 'Los campos year y quarter son obligatorios'
        })
    }

    await obtenerUsuarios({year, quarter, search, status}).then( (usuarios) => {

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Reporte de rendimiento');
        
        worksheet.addRow(['Nombre', 'Apellido Paterno', 'Apellido Materno', 'Total Objetivos', 'Objetivos', 'Competencias', 'Resultado final', 'Bono', 'Status'])
        usuarios && usuarios.forEach( (usuario) => {
            const { nombre, apellidoPaterno, apellidoMaterno, rendimiento } = usuario
            const { resultadoObjetivos, resultadoCompetencias, resultadoFinal, bono, status, countObjetivos } = rendimiento
        
            // Header

            worksheet.addRow( 
                [ 
                    nombre, 
                    apellidoPaterno, 
                    apellidoMaterno, 
                    Number(countObjetivos), 
                    Math.trunc(Number(resultadoObjetivos) * 100) / 100,
                    Math.trunc(Number(resultadoCompetencias) * 100) / 100,
                    Math.trunc(Number(resultadoFinal) * 100) / 100,
                    Number(bono), status]
                )
        })

        workbook.xlsx.writeBuffer().then( (buffer) => {
            res.setHeader('Content-Disposition', 'attachment; filename=registros.xlsx');
            res.type('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.send(buffer);
        }).catch( (error) => {
            return res.status(500).json({
                msg: 'Error al generar el reporte de rendimiento',
                error
            })
        })

    }).catch( (error) => {
        return res.status(500).json({
            msg: 'Error al obtener los usuarios',
            error
        })
    })  


}


export const calcularBono = (total: number) => {

    const rangos: { [key: number]: number } = {
        0: 0,
        85: 0,
        86: 75,
        88: 80,
        90: 85,
        92: 90,
        94: 95,
        96: 100,
        98: 105,
        100: 110,
    };

    let puntuacion = 0;
    for (let rango in rangos) {
        if (total >= parseInt(rango)) {                
            puntuacion = rangos[rango];
        } else {
            break;
        }
    }

    return puntuacion;

} 


export const obtenerUsuarios = async ({year, quarter, search, status}: any) => {
    try {
        const usuarios = await Usuarios.findAll({
            attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'iniciales', 'email', 'foto', 'slug', 'leaderId'],
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
            }],
            // like nombre, apellidoPaterno o apellidoMaterno
            where: search ? {
                [Op.or]: [
                    literal('CONCAT(nombre, " ", apellidoPaterno) LIKE :search'),
                    literal('CONCAT(nombre, " ", apellidoMaterno) LIKE :search'),
                    literal('CONCAT(nombre, " ", apellidoPaterno, " ", apellidoMaterno) LIKE :search'),
                    literal('nombre LIKE :search'),
                    literal('apellidoPaterno LIKE :search'),
                    literal('apellidoMaterno LIKE :search'),
                ],
            } : {},
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
                    bono: calcularBono(resultadoFinal),
                    status
                }
            }
        })
        return usuariosRendimiento

    } catch (error) {
        console.log(error)
    }
}