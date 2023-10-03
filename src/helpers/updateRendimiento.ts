import { AsignacionEvaluacion, EvaluacionRespuesta, ObjetivoOperativos, PivotOpUsuario, Rendimiento } from "../models"


export const updateRendimiento = async () => {

    const usuarioId = 'ebcd7a49-21f4-454a-828c-94d7ef8a5a95'
    const year = 2023
    const quarter = 3

    //   Obtener usuario y objetivos operativos
    const objetivosOperativos = await ObjetivoOperativos.findAll({
        where: {
            year,
            quarter
        },
    })

   const operativosArrayId = objetivosOperativos.map( (obj: any) => obj.id);

   const resultadoObjetivos = await PivotOpUsuario.findAll({
         where: {
              objetivoOperativoId: operativosArrayId,
              usuarioId
         }
    });

    //  Obtener el resultado del pivotOp donde progresoReal / progresoAsignado

    const resultadoObjetivosTotal = resultadoObjetivos.reduce((acc: any, obj: any) => {

        if(obj.progresoAsignado === 0) return acc;

        const resultado = (obj.progresoAsignado / 100) *  obj.progresoReal;
        return acc + resultado;
    }, 0);
    

    //  Obtener el resultado de las competencias

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

    // la sumatoria de todos los resultadoCompetencias.resultado / resultadoCompetencias.length

    const resultadoCompetenciasTotal = resultadoCompetencias.reduce((acc: any, obj: any) => {
        return acc + obj.resultado
    }, 2) / resultadoCompetencias.length;
    

    //  Obtener el resultado parcial
    

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