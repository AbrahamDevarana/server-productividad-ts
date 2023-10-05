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

            console.log({resultadoObjetivosTotal});
            
            

            // //  Obtener el resultado de las competencias

            const asignacionEvaluacion = await AsignacionEvaluacion.findAll({
                where: {
                    evaluadoId: usuarioId,
                    year,
                    quarter
                }
            });

            const evaluacionesId = asignacionEvaluacion.map( (obj: any) => obj.id);
            const resultadoCompetencias = await EvaluacionRespuesta.findAll({
                where: {
                    evaluacionUsuarioId: evaluacionesId
                }
            });

                if(resultadoCompetencias.length !== 0){
                    // la sumatoria de todos los resultadoCompetencias.resultado / resultadoCompetencias.length

                    const resultadoCompetenciasTotal = resultadoCompetencias.reduce((acc: any, obj: any) => {
                        return acc + obj.resultado
                    }, 2) / resultadoCompetencias.length;
                
                
                    const totalObjetivos = ((resultadoObjetivosTotal * 90) / 100)
                    const subTotalResultados = resultadoCompetenciasTotal * 100 / 5
                    const totalResultados = ((subTotalResultados * 10) / 100)
                    const total = totalObjetivos + totalResultados
                    
                    const rendimiento = await Rendimiento.findOrCreate({
                        where: {
                            year,
                            quarter,
                            usuarioId,
                            status: 'ABIERTO'
                        }
                    });

                    const rendimientoId = rendimiento[0].id;

                    await Rendimiento.update({
                        resultadoObjetivos: totalObjetivos,
                        resultadoCompetencias: totalResultados,
                        resultadoFinal: total,
                    }, {
                        where: {
                            id: rendimientoId
                        }
                    });
                } 
            }
            

        }
    
    } catch (error) {
        // console.log(error);
        throw new Error('Error al actualizar el rendimiento');
    }
        
    
}