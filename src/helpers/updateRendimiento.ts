import { AsignacionEvaluacion, EvaluacionRespuesta, ObjetivoOperativos, PivotOpUsuario, Rendimiento } from "../models"


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
        let evaluacionesLength = 0

        const operativosArrayId = objetivosOperativos.map( (obj: any) => obj.id);
        
        if(operativosArrayId.length !== 0) {
            const resultadoObjetivos = await PivotOpUsuario.findAll({
                where: {
                    objetivoOperativoId: operativosArrayId,
                    usuarioId
                }
            });

            if(resultadoObjetivos.length !== 0){

            // //  Obtener el resultado del pivotOp donde progresoReal / progresoAsignado

            const resultadoObjetivosTotal = resultadoObjetivos.reduce((acc: any, obj: any) => {

                if(obj.progresoAsignado === 0) return acc;

                const resultado = (obj.progresoAsignado / 100) *  obj.progresoReal;
                return acc + resultado;
            }, 0);

            if(resultadoObjetivosTotal && resultadoObjetivosTotal !== 0){
                totalObjetivos = ((resultadoObjetivosTotal * 90) / 100)
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
                            evaluacionUsuarioId: asignacion.id
                        }
                    });
                    // obtener el promedio de cada respuesta y sumarlos en acumulado siempre cuidando que no sea null o infinity o NaN sino 0
                    const preResultado = respuesta.reduce((acc: any, obj: any) => {
                        return acc + obj.resultado
                    }, 0)

                    const resultado = preResultado / respuesta.length

                    acumulado = acumulado + resultado
                }

                const totalPromedio = acumulado / asignacionEvaluacion.length || 0

                if(totalPromedio && totalPromedio !== 0){
                    subTotalResultados = (totalPromedio * 100) / 5
                    totalResultados = ((subTotalResultados * 10) / 100)
                    
                }
            }
        }

        const rendimiento = await Rendimiento.findOrCreate({
            where: {
                year,
                quarter,
                usuarioId,
                status: 'ABIERTO'
            }
        });

        const rendimientoId = rendimiento[0].id;

        total = totalObjetivos + totalResultados
        await Rendimiento.update({
            resultadoObjetivos: totalObjetivos,
            resultadoCompetencias: totalResultados,
            resultadoFinal: total,
        }, {
            where: {
                id: rendimientoId
            }
        });
    
    } catch (error) {
        console.log(error);
        throw new Error('Error al actualizar el rendimiento');
    }
        
    
}