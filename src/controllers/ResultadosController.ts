import { Request, Response } from "express";
import { ObjetivoOperativos, PivotOpUsuario, Rendimiento, ResultadosClave, Usuarios } from "../models";
import { UsuarioInterface } from "../interfaces";
import dayjs from "dayjs";
import { Task } from "../models/Task";
import { Op } from "sequelize";

const includeProps = [
    {
        model: Usuarios,
        as: 'propietario',
        attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'iniciales', 'email', 'foto', 'slug', 'leaderId'],

    },
    {
        model: Task,
        as: 'task',
        attributes: ['id', 'nombre', 'descripcion', 'prioridad', 'propietarioId', 'fechaFin', 'status', 'taskeableId', 'progreso'],
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
    const { operativoId } = req.body;

    const { id: propietarioId } = req.user as UsuarioInterface

    try {

        const objetivo = await ObjetivoOperativos.findByPk(operativoId);

        
        if(objetivo){
            const { year, quarter } = objetivo;           
            const firstDay = dayjs().year(year).quarter(quarter).startOf('quarter').toDate();
            const lastDay = dayjs().year(year).quarter(quarter).endOf('quarter').subtract(1, 'day').toDate();



            const resultadoClave = await ResultadosClave.create({
                propietarioId,
                operativoId,
                tipoProgreso: "acciones",
                nombre: 'Nuevo resultado clave',
                status: 'SIN_INICIAR',
                progreso: 0,
                fechaInicio: firstDay,
                fechaFin: lastDay,
                color: 'rgba(101, 106, 118, 1)'
            });

            const nombres = ['Acción 1', 'Acción 2'];

            if(resultadoClave.id){
                for (const nombre of nombres) {
                    await Task.create({
                        nombre,
                        propietarioId,
                        taskeableId: resultadoClave.id,
                        taskeableType: 'RESULTADO_CLAVE',
                        prioridad: 'MEDIA',
                        status: 'SIN_INICIAR',
                        progreso: 0,
                        fechaFin: resultadoClave.fechaFin,
                    })   

                }
            }

            await resultadoClave.reload({
                include: includeProps
            })

            await updateProgresoObjetivo({objetivoOperativoId: operativoId});
            res.json({ resultadoClave });

        }else{
            return res.status(404).json({
                msg: 'No existe un objetivo'
            });
        }
        
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
                    taskeableType: 'RESULTADO_CLAVE',
                    status: ['FINALIZADO', 'SIN_INICIAR', 'EN_PROCESO']
                }
            })

        //     let accionesCompletadas = 0;
        //     let accionesTotales = 0;

        //    if(tasks.length > 0){
        //         tasks.forEach(task => {
        //             if(task.status === 'FINALIZADO'){
        //                 accionesCompletadas++;
        //             }
        //             accionesTotales++;
        //         })

        //         progresoTotal = accionesCompletadas/accionesTotales * 100
        //     }

            let progresioAcciones = 0;
            tasks.forEach(task => {
                progresioAcciones += task.progreso;
            });

            // Calculamos el promedio del progreso dividiendo el progreso total entre el número total de tareas que cumplen con la condición de estado
            let promedioProgreso = 0;
            if (tasks.length > 0) {
                promedioProgreso = progresioAcciones / tasks.length;
            }

            progresoTotal = promedioProgreso;            

        }else{
            progresoTotal = progreso;
        }

        if(!progreso && tipoProgreso !== 'acciones'){
            progresoTotal = 0;
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
            where: {
                status: 'ACTIVO'
            }
        });

        const rankingCompetencias = usuarios.filter((usuario: any) => usuario.rendimiento[0]?.resultadoCompetencias > 1)
        .sort((a: any, b: any) => b.rendimiento[0]?.resultadoCompetencias - a.rendimiento[0]?.resultadoCompetencias)
        .map((usuario: any) => usuario).splice(0, 10);

        const rankingUsuarios = usuarios.filter((usuario: any) => usuario.rendimiento[0]?.resultadoFinal > 10)
            .sort((a: any, b: any) => b.rendimiento[0]?.resultadoFinal - a.rendimiento[0]?.resultadoFinal)
            .map((usuario: any) => usuario).splice(0, 10);

        res.json({ 
            rankingUsuarios,
            rankingCompetencias
        });
        
    } catch (error) {
        console.log(error);

        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }



}

export const duplicateResultadoClave = async (req: Request, res: Response) => {

    const { resultadoId } = req.body;

    try {
        
        const resultadoClave = await ResultadosClave.findOne({
            where: {
                id: resultadoId
            },
        });

        if(!resultadoClave){
            return res.status(404).json({
                msg: 'No se pudo realizar el duplicado'
            });
        }

        const tasks = await Task.findAll({
            where: {
                taskeableId: resultadoClave.id,
                taskeableType: 'RESULTADO_CLAVE'
            }
        })

        const nuevoResultado = await ResultadosClave.create({
            propietarioId: resultadoClave.propietarioId,
            operativoId: resultadoClave.operativoId,
            tipoProgreso: resultadoClave.tipoProgreso,
            nombre: resultadoClave.nombre,
            status: 'SIN_INICIAR',
            progreso: 0,
            fechaInicio: resultadoClave.fechaInicio,
            fechaFin: resultadoClave.fechaFin,
            color: resultadoClave.color
        });

        // buscar las Task del resultado clave

        if(nuevoResultado.id){
            if(tasks.length > 0){
                for (const task of tasks) {
                    await Task.create({
                        nombre: task.nombre,
                        propietarioId: task.propietarioId,
                        taskeableId: nuevoResultado.id,
                        taskeableType: task.taskeableType,
                        prioridad: task.prioridad,
                        status: task.status,
                        progreso: task.progreso,
                        fechaFin: task.fechaFin,
                    })   
    
                }
            }
        }

        await nuevoResultado.reload({
            include: includeProps
        })

        await updateProgresoObjetivo({objetivoOperativoId: resultadoClave.operativoId});

        res.json({ resultadoClave: nuevoResultado });
        
        
    } catch (error) {

        console.log(error);

        res.status(500).json({
            msg: 'Hable con el administrador'
        });
        
    }


}