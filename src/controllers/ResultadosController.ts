import { Request, Response } from "express";
import { Acciones, ResultadosClave } from "../models";
import { UsuarioInterface } from "../interfaces";


const includeProps = [
    {
        model: Acciones,
        as: 'acciones',
        attributes: ['id', 'nombre', 'descripcion', 'status', 'resultadoClaveId', 'propietarioId'],
    }
]
 
export const getResultadosClave = async (req: Request, res: Response) => {
    const { operativoId } = req.query;    
    
    
    let where: any = {}

    if(operativoId){
        where.operativoId = operativoId;
    }

    try {
        const resultadosClave = await ResultadosClave.findAll({
            where: where,
            order: [['createdAt', 'ASC']],
            include: includeProps

        });

        res.json({ resultadosClave });
    }
    catch (error) {
        console.log(error);

        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const getResultadoClave = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const resultadoClave = await ResultadosClave.findByPk(id,{
            include: includeProps
        });
        
        if (!resultadoClave) {
            return res.status(404).json({
                msg: 'No existe un resultado clave con el id ' + id
            });
        }

        res.json({ resultadoClave });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Hable con el administrador' });
    }
}

export const createResultadosClave = async (req: Request, res: Response) => {
    const { operativoId } = req.body;

    const { id: propietarioId } = req.user as UsuarioInterface

    try {
        const resultadoClave = await ResultadosClave.create({
            propietarioId,
            operativoId,
            tipoProgreso: "acciones",
            nombre: 'Nuevo resultado clave',
        });

        await resultadoClave.reload({
            include: includeProps
        })

        res.json({ resultadoClave });
    }
    catch (error) {
        console.log(error);

        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const updateResultadosClave = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { nombre, propietarioId, operativoId, status, progreso, tipoProgreso, fechaInicio, fechaFin} = req.body;

    try {
        const resultadoClave = await ResultadosClave.findByPk(id,
            {include: includeProps}
        );

        if (!resultadoClave) {
            return res.status(404).json({
                msg: 'No existe un resultado clave con el id ' + id
            });
        }
        
        let progresoTotal = 0;

        if(tipoProgreso === "acciones"){
            //Actualizar el progreso del resultado clave con el progreso de las acciones que solo tienen 2 estados, completado o no completado
            let acciones = await Acciones.findAll({
                where: {
                    resultadoClaveId: id
                }
            });

            let accionesCompletadas = 0;
            let accionesTotales = 0;

            acciones.forEach(accion => {
                if(accion.status === 1){
                    accionesCompletadas++;
                }
                accionesTotales++;
            })

            progresoTotal = accionesCompletadas/accionesTotales * 100
        }else{
            progresoTotal = progreso;
        }

        await resultadoClave.update({ nombre, propietarioId, operativoId, status, progreso: progresoTotal, tipoProgreso, fechaInicio, fechaFin  });

        await resultadoClave.reload({
            include: includeProps
        })

        res.json({ resultadoClave });
    }
    catch (error) {
        console.log(error);

        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const deleteResultadosClave = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const resultadoClave = await ResultadosClave.findByPk(id);

        if (!resultadoClave) {
            return res.status(404).json({
                msg: 'No existe un resultado clave con el id ' + id
            });
        }

        await resultadoClave.destroy();

        res.json({ resultadoClave });
    }
    catch (error) {
        console.log(error);

        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}