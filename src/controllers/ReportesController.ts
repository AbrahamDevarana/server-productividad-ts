import { Request, Response } from 'express'
import { Usuarios, Rendimiento} from '../models'
import ExcelJS from 'exceljs'
import { Op, Sequelize, literal } from 'sequelize'
import { updateRendimiento } from '../helpers/updateRendimiento'
import { generatePdfService, generateReportService, getUsuariosRendimientoService, sendEmailWithAttachmentService } from '../services'
import { getBono } from '../helpers/getBono'
import { getQuarterMonths } from '../helpers/getQuarterMonths'
import { getBodyReportHtml } from '../html/mailReportHtml'

const VALOR_OBJETIVOS = 90
const VALOR_COMPETENCIAS = 10


export const obtenerRendimiento = async (req: Request, res: Response) => {
    
    const { year, quarter, search, status, statusUsuario = 'ALL'} = req.query

    if( !year || !quarter ) {
        return res.status(400).json({
            msg: 'Los campos year y quarter son obligatorios'
        })
    }

    await obtenerUsuarios({year, quarter, search, status, statusUsuario}).then( (usuarios) => {
    
        return res.json({usuarios})
    }).catch( (error) => {
        return res.status(500).json({
            msg: 'Error al obtener los usuarios',
            error
        })
    })  
}

export const generarReporteRendimientoExcel = async (req: Request, res: Response) => {

    const { year, quarter, search, status, statusUsuario} = req.query as { year: string, quarter: string, search: string, status: string, statusUsuario: string }

    if( !year || !quarter ) {
        return res.status(400).json({
            msg: 'Los campos year y quarter son obligatorios'
        })
    }

    await getUsuariosRendimientoService({year: Number(year), quarter:Number(quarter), search, status, statusUsuario}).then( (usuarios) => {

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Reporte de rendimiento');
        
        worksheet.addRow(['No','Área', 'Departamento', 'Nombre', 'Apellido Paterno', 'Apellido Materno', 'Objetivos', 'Competencias', 'Resultado final', 'Bono', 'Status'])
        usuarios && usuarios.forEach( (usuario, index) => {

            const { nombre, apellidoPaterno, apellidoMaterno, rendimiento, area, departamento } = usuario
            const { resultadoObjetivos, resultadoCompetencias, resultadoFinal, bono, status } = rendimiento
            let statusObjetivos = status === 'ABIERTO' ? 'EN EJECUCIÓN' : status
        
            worksheet.addRow( 
                [ 
                    index+1,
                    area,
                    departamento,
                    nombre,
                    apellidoPaterno, 
                    apellidoMaterno, 
                    Math.trunc(Number(resultadoObjetivos) * 100) / 100,
                    Math.trunc(Number(resultadoCompetencias) * 100) / 100,
                    Math.trunc(Number(resultadoFinal) * 100) / 100,
                    Number(bono), 
                    statusObjetivos
                ]
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

export const obtenerUsuarios = async ({year, quarter, search, status, statusUsuario}: any) => {
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
                        status ? { status } : {},
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
            where: {
                [Op.and]: [
                    { status: statusUsuarios },
                    where,
                    // { isEvaluable: true }
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
        console.log(error)
    }
}

export const generateReport = async (req: Request, res: Response) => {

    const { areaId, departamentosIds, sign, send, quarter, year} = req.body as { areaId: number, departamentosIds: number[], sign: boolean, send: boolean, quarter: number, year: number }

    
    const areaReport = {
        id: areaId,
        departamentosIds,
        sign,
        send
    }
    
    try {
        const report = await generateReportService({areaReport, options: { quarter, year, sign, send }})
        const pdfBuffer = await generatePdfService(report, { quarter, year, sign, send })
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        const { months } = getQuarterMonths(quarter, year)

        const periodo = `${months[0]} - ${months[1]}`
        const liderName = `${report.leader.nombre} ${report.leader.apellidoPaterno} ${report.leader.apellidoMaterno}`

        if(send){
            sendEmailWithAttachmentService({
                attachment: pdfBuffer, 
                body: getBodyReportHtml({ fullName: liderName, periodo, year }),
                to:['abrahamalvarado@devarana.mx', 'maximilianogonzalez@devarana.mx'], 
                replyTo: 'maximilianogonzalez@devarana.mx',
                filename: `Reporte-${report.nombre}-${Date.now()}.pdf`, 
                subject: `Reporte de desempeño trimestre ${periodo} ${year}`,                
        })
        }

        const base64File = pdfBuffer.toString('base64');

        return res.json({fileName: `Reporte-${report.nombre}-${Date.now()}.pdf`, file: base64File})
    } catch (error) {
        console.log("❌ Error al generar el reporte:", error); // Debug
        return res.status(500).json({
            msg: 'Error al generar el reporte',
            error
        })
    }
}