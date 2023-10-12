import { Request, Response } from 'express'
import { Usuarios, Rendimiento} from '../models'
import ExcelJS from 'exceljs'

const VALOR_OBJETIVOS = 90
const VALOR_COMPETENCIAS = 10


export const obtenerRendimientoUsuarios = async (req: Request, res: Response) => {
    
    const { year, quarter } = req.query
    
    try {
        const usuarios = await Usuarios.findAll({
            attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'iniciales', 'email', 'foto', 'slug', 'leaderId'],
            include: [{
                model: Rendimiento,
                as: 'rendimiento',
                where: { year, quarter }
            }]
        })
        res.json({
            usuarios
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            msg: 'Error al obtener los usuarios'
        })
    }
}

export const generarReporteRendimiento = async (req: Request, res: Response) => {

    const { year, quarter } = req.params




}