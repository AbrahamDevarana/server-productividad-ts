import { Request, Response } from "express";
import { Acciones, PivotOpUsuario, ResultadosClave, Usuarios } from "../models";
import { UsuarioInterface } from "../interfaces";
import dayjs from "dayjs";


const includeProps = [
    {
        model: Acciones,
        as: 'acciones',
        attributes: ['id', 'nombre', 'descripcion', 'status', 'resultadoClaveId', 'propietarioId', 'fechaInicio', 'fechaFin'],
    },
    {
        model: Usuarios,
        as: 'propietario',
        attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'iniciales', 'email', 'foto', 'slug', 'leaderId'],

    }
]
 
export const getResultadosClave = async (req: Request, res: Response) => {
    const { operativoId } = req.query;    
    
    
    const where: any = {}

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
            status: 'SIN_INICIAR',
            progreso: 0,
            fechaInicio: dayjs().startOf('quarter').toDate(),
            fechaFin: dayjs().endOf('quarter').toDate(),

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

    const { id: userId } = req.user as UsuarioInterface

    
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
            const acciones = await Acciones.findAll({
                where: {
                    resultadoClaveId: id
                }
            });

            let accionesCompletadas = 0;
            let accionesTotales = 0;

           if(acciones.length > 0){
                acciones.forEach(accion => {
                    if(accion.status === 1){
                        accionesCompletadas++;
                    }
                    accionesTotales++;
                })

                progresoTotal = accionesCompletadas/accionesTotales * 100
            }

        }else{
            progresoTotal = progreso;
        }
        await resultadoClave.update({ nombre, propietarioId, operativoId, status, progreso: progresoTotal, tipoProgreso, fechaInicio, fechaFin  });

        await updateProgresoObjetivo({objetivoOperativoId: operativoId, responsableId: userId});

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

// Actualiza el valor del resultado clave y objetivos
export const updateProgresoObjetivo = async ({objetivoOperativoId}: any) => {

    const objetivos = await PivotOpUsuario.findAll({
        where: {
            objetivoOperativoId
        }
    })

    const resultadosClave = await ResultadosClave.findAll({
        where: {
            operativoId: objetivoOperativoId
        }
    })

    let promedioResultadosClave = 0;

    if(resultadosClave.length > 0){
        resultadosClave.forEach(resultadoClave => {
            promedioResultadosClave += resultadoClave.progreso;
        })
        promedioResultadosClave = promedioResultadosClave/resultadosClave.length;
    }

    if(objetivos.length > 0){
        objetivos.forEach(async objetivo => {
            objetivo.progresoReal = promedioResultadosClave;
            await objetivo.save();
        })
    }
}