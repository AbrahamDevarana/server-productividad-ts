import { Areas, ObjetivoEstrategico, Tacticos, Usuarios } from '../models'
import { Request, Response } from 'express'
import { Op } from 'sequelize'
import dayjs from 'dayjs'


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
            },
            {
                model: Usuarios,
                as: 'propietario',
                attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'iniciales', 'email', 'foto'],
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
        const objetivoTactico = await Tacticos.findByPk(id, { include: ['responsables', 'areas', 'propietario', 'estrategico'] });
        if (objetivoTactico) {

            res.json({
                objetivoTactico
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
    const { nombre, codigo, meta, indicador, fechaInicio, fechaFin, responsablesArray = [], areasArray = [], estrategicoId = null, propietarioId } = req.body;

    try {
        const trimestres = Math.ceil(dayjs(fechaFin).diff(fechaInicio, 'month', true) / 3);        

        let arrayTactico = []
        for (let i = 0; i < trimestres+1; i++) {
            const fechaInicioTrimestre = dayjs(fechaInicio).add(i*3, 'month').format('YYYY-MM-DD') + ' 00:01:00';
            const fechaFinTrimestre = i < trimestres - 1 ? dayjs(fechaInicio).add((i+1)*3, 'month').subtract(1, 'day').format('YYYY-MM-DD') : fechaFin;
            

            const objetivoTactico = await Tacticos.create({ 
                nombre, 
                codigo, 
                meta, 
                indicador, 
                fechaInicio: fechaInicioTrimestre,
                fechaFin: fechaFinTrimestre,
                propietarioId, 
                estrategicoId: estrategicoId ? estrategicoId : null,
                trimestres: i+1,
            });
            
            await objetivoTactico.setResponsables(responsablesArray);
            await objetivoTactico.setAreas(areasArray);
            await objetivoTactico.reload({ include: ['responsables', 'areas', 'propietario', 'estrategico'] });
            
            arrayTactico.push(objetivoTactico);
                
            if ( i > 0 ) {
                await Tacticos.update({ objetivoPadre: arrayTactico[0].id }, { where: { id: arrayTactico[i].id } });
            }
        }

        res.json({
            objetivoTactico: arrayTactico[0]
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
    const { nombre, codigo, meta, indicador, fechaInicio, fechaFin,  status, responsablesArray = [], areasArray = [], propietarioId, estrategicoId} = req.body;
    

    try {
        const objetivoTactico = await Tacticos.findByPk(id);
        if (objetivoTactico) {
            await objetivoTactico.update({ 
                nombre, 
                codigo, 
                meta, 
                indicador, 
                fechaInicio, 
                fechaFin, 
                estrategicoId: estrategicoId ? estrategicoId : null, 
                status, 
                propietarioId });
            await objetivoTactico.setResponsables(responsablesArray);
            await objetivoTactico.setAreas(areasArray);

            await objetivoTactico.reload({ include: ['responsables', 'areas', 'propietario', 'estrategico'] });

            res.json({
                objetivoTactico
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
        const objetivoTactico = await Tacticos.findByPk(id);
        if (objetivoTactico) {
            await objetivoTactico.destroy();
            res.json({
                objetivoTactico
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
    const { year, quarter, limit, offset } = req.query;
   

    let where = {};
    
    if( year && quarter ) {
        const { startDate, endDate } = getQuarterDates(Number(year), Number(quarter));

        where = {
            fechaInicio: { [Op.between]: [startDate.toDate(), endDate.toDate()] }
        }
    }    
    

    const includes = [
        {
            model: Areas,
            as: 'areas',
            through: { attributes: [] },
            attributes: ['id', 'nombre'],
            where: { slug }
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
        }
    ]

    
    try {
        const tacticos = await Tacticos.findAll({
            include: includes,
            where: {
                ...where,
                [Op.not]: { estrategicoId: null }
            }
        });

        const tacticos_core = await Tacticos.findAll({
            include: includes,
            where: {
                ...where,
                estrategicoId: null
            },
        });


        
            
        res.json({ objetivosTacticos: { tacticos, tacticos_core } });
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
                    as: 'estrategico',
                    where: { id: estrategiaId }
                },
                {
                    model: Usuarios,
                    as: 'responsables',
                    through: { attributes: [] },
                },
                {
                    model: Areas,
                    as: 'areas',
                    through: { attributes: [] },
                },
                {
                    model: Usuarios,
                    as: 'propietario',
                    attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'email', 'iniciales', 'foto'],
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



const getQuarterDates = (year:number, quarter:number) => {
    const startQuarter = (quarter - 1) * 3 + 1;
    const startDate = dayjs(`${year}-${startQuarter}-01`).startOf('month');
    const endDate = startDate.add(2, 'month').endOf('month');
    return { startDate, endDate };
  }
  
