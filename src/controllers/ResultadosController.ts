import { Request, Response } from "express";
import { PivotOpUsuario, Rendimiento, ResultadosClave, Usuarios } from "../models";
import { UsuarioInterface } from "../interfaces";
import dayjs from "dayjs";
import { Task } from "../models/Task";

const includeProps = [
    {
        model: Usuarios,
        as: 'propietario',
        attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'iniciales', 'email', 'foto', 'slug', 'leaderId'],

    },
    {
        model: Task,
        as: 'task',
        attributes: ['id', 'nombre', 'descripcion', 'prioridad', 'propietarioId', 'fechaFin', 'status', 'taskeableId'],
        include: [
            {
                model: Usuarios,
                as: 'propietario',
                attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'iniciales', 'email', 'foto', 'slug', 'leaderId'],
            }
        ]
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
    const { operativoId, quarter } = req.body;

    const { id: propietarioId } = req.user as UsuarioInterface

    try {
        const resultadoClave = await ResultadosClave.create({
            propietarioId,
            operativoId,
            tipoProgreso: "acciones",
            nombre: 'Nuevo resultado clave',
            status: 'SIN_INICIAR',
            progreso: 0,
            fechaInicio: dayjs().startOf(quarter).toDate(),
            fechaFin: dayjs().endOf(quarter).toDate(),
            color: 'rgba(101, 106, 118, 1)'
        });

    

        // Crear 3 tasks

        const nombres = ['Acción 1', 'Acción 2', 'Acción 3'];

        if(resultadoClave.id){
            for (const nombre of nombres) {
                await Task.create({
                    nombre,
                    propietarioId,
                    taskeableId: resultadoClave.id,
                    taskeableType: 'RESULTADO_CLAVE',
                    prioridad: 'NORMAL',
                    status: 'SIN_INICIAR',
                    fechaFin: resultadoClave.fechaFin,
                })   

            }
        }

        await resultadoClave.reload({
            include: includeProps
        })

        await updateProgresoObjetivo({objetivoOperativoId: operativoId});
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
    const { nombre, propietarioId, operativoId, status, progreso, tipoProgreso, fechaInicio, fechaFin, color} = req.body;
    
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
            const tasks = await Task.findAll({
                where: {
                    taskeableId: resultadoClave.id,
                    taskeableType: 'RESULTADO_CLAVE'
                }
            })

            let accionesCompletadas = 0;
            let accionesTotales = 0;

           if(tasks.length > 0){
                tasks.forEach(task => {
                    if(task.status === 'FINALIZADO'){
                        accionesCompletadas++;
                    }
                    accionesTotales++;
                })

                progresoTotal = accionesCompletadas/accionesTotales * 100
            }

        }else{
            progresoTotal = progreso;
        }
        await resultadoClave.update({ nombre, propietarioId, operativoId, status, progreso: progresoTotal, tipoProgreso, fechaInicio, fechaFin, color });

        await updateProgresoObjetivo({objetivoOperativoId: operativoId});

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

        await updateProgresoObjetivo({objetivoOperativoId: resultadoClave.operativoId});
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


export const getRanking = async (req: Request, res: Response) => {

    const { year, quarter } = req.query;

    try {

        const usuarios = await Usuarios.findAll({
            attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'iniciales', 'email', 'foto', 'slug', 'leaderId'],
            include: [
                {
                    model: Rendimiento,
                    as: 'rendimiento',
                    where: {
                        year,
                        quarter
                    },
                },
            ],
        });
        
    
        const usuariosOrdenados = usuarios.sort((a: any, b: any) => {
            // de mayor a menor
            return b.rendimiento[0]?.resultadoFinal - a.rendimiento[0]?.resultadoFinal;
        })
        res.json({rankingUsuarios: usuariosOrdenados});
        
    } catch (error) {
        console.log(error);

        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }



}