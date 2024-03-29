import { AsignacionEvaluacion, EvaluacionRespuesta, ObjetivoOperativos, PivotOpUsuario, Rendimiento } from "../models"
import { PivotObjetivoRendimiento } from "../models/pivot/PivotObjetivoRendimiento";


interface Props {
    usuarioId: string;
    year: number;
    quarter: number;
}

export const updateRendimiento = async ({ usuarioId, quarter, year }: Props) => {

    try {

        const objetivosOperativos = await ObjetivoOperativos.findAll({
            where: {
                year,
                quarter
            },
        })

        let totalObjetivos = 0;
        let subTotalResultados = 0;
        let totalResultados = 0;
        let total = 0;

        
        const statusMapping = {
            'NUEVO': 'NUEVO',
            'PENDIENTE_AUTORIZAR': 'PENDIENTE_AUTORIZAR',
            'ABIERTO': 'ABIERTO',
            'PENDIENTE_APROBACION': 'PENDIENTE_APROBACION',
            'APROBADO': 'APROBADO'
        };

        let statusFinal = 'NUEVO';

        const operativosArrayId = objetivosOperativos.map( (obj: any) => obj.id);

        const [rendimiento, created] = await Rendimiento.findOrCreate({
            where: {
                year,
                quarter,
                usuarioId,
            }
        });
        
        if(operativosArrayId.length !== 0) {
            const resultadoObjetivos = await PivotOpUsuario.findAll({
                where: {
                    objetivoOperativoId: operativosArrayId,
                    usuarioId
                }
            });

            if(resultadoObjetivos.length === 0){
                statusFinal = 'NUEVO'
            }else {
                statusFinal = resultadoObjetivos.some(obj => obj.status === statusMapping['NUEVO']) ? 'NUEVO' :
                resultadoObjetivos.every(obj => obj.status === statusMapping['PENDIENTE_AUTORIZAR']) ? 'PENDIENTE_AUTORIZAR' :
                resultadoObjetivos.every(obj => obj.status === statusMapping['ABIERTO']) ? 'ABIERTO' :
                resultadoObjetivos.every(obj => obj.status === statusMapping['PENDIENTE_APROBACION']) ? 'PENDIENTE_APROBACION' :
                resultadoObjetivos.every(obj => obj.status === statusMapping['APROBADO']) ? 'APROBADO' : statusFinal;

            }

           
        
            if(resultadoObjetivos.length !== 0){

                const destroyed = await PivotObjetivoRendimiento.destroy
                    ({
                        where: {
                            rendimientoId: rendimiento.id,
                            year,
                            quarter
                        },
                    })

                
                const resultadoObjetivosTotal = resultadoObjetivos.reduce((acc: any, obj: any) => {

                    if(obj.progresoAsignado === 0) return acc;

                    const resultado = (obj.progresoAsignado / 100) *  obj.progresoReal;
                    return acc + resultado;
                }, 0);

                if(resultadoObjetivosTotal && resultadoObjetivosTotal !== 0){
                    totalObjetivos = ((resultadoObjetivosTotal * 90) / 100)
                }

                const resultadoArrId = resultadoObjetivos.map( resultado => resultado.id)

                if(destroyed){
                    for (const id of resultadoArrId) {
                        await PivotObjetivoRendimiento.create({
                            objOperativoId: id,
                            rendimientoId: rendimiento.id,
                            year,
                            quarter
                        })

                    }
                }
            }
        }
            // Obtener Evaluaciones
            const asignacionEvaluacion = await AsignacionEvaluacion.findAll({
                where: {
                    evaluadoId: usuarioId,
                    year,
                    quarter
                }
            });


            let acumulado = 0;

            for (const asignacion of asignacionEvaluacion) {
                // Por cada evaluacion obtener el resultado de las respuestas
                const respuesta = await EvaluacionRespuesta.findAll({
                    where: {
                        evaluacionUsuarioId: asignacion.id,
                        status: 1
                    }
                });                

                
                // obtener el promedio de cada respuesta y sumarlos en acumulado siempre cuidando que no sea null o infinity o NaN sino 0

                const preResultado = respuesta.reduce((acc: any, obj: any) => {
                    if (typeof obj.resultado === 'number' && !isNaN(obj.resultado)) {
                        return acc + obj.resultado;
                    } else {
                        // Si obj.resultado no es un número válido, no lo sumes y devuelve el valor acumulado sin cambios
                        return acc;
                    }
                }, 0)

                if(preResultado === 0 && respuesta.length === 0) {
                    acumulado = acumulado + 0
                    continue;
                }else{
                    const resultado = preResultado / respuesta.length
                   acumulado = acumulado + resultado
                }

            }

            if (acumulado === 0 && asignacionEvaluacion.length === 0) {
                subTotalResultados = 0
                totalResultados = 0
            }else {

                const totalPromedio = acumulado / asignacionEvaluacion.length

                if(totalPromedio && totalPromedio !== 0){
                    subTotalResultados = (totalPromedio * 100) / 5
                    totalResultados = ((subTotalResultados * 10) / 100)
                    
                }
            }
           
       

        const rendimientoId = rendimiento.id;

        total = totalObjetivos + totalResultados
        

        if(rendimiento.status !== 'CERRADO'){

            await Rendimiento.update({
                resultadoObjetivos: totalObjetivos,
                resultadoCompetencias: totalResultados,
                resultadoFinal: total,
                status: statusFinal
            }, {
                where: {
                    id: rendimientoId
                }
            });
        }
    
    } catch (error) {
        console.log(error);
        throw new Error('Error al actualizar el rendimiento');
    }
        
    
}