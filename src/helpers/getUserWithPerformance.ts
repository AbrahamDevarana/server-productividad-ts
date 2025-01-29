import { Report } from "../interfaces/Report";

export const getUsersWithPerformance = (report: Report) => {
    
        return report?.departamentos?.map((departamento) => ({
            id: departamento.id,
            nombre: departamento.nombre,
            leader: departamento.leader,
            usuarios: departamento.usuarios.map((usuario) => ({
                id: usuario.id,
                nombre: usuario.nombre,
                apellidoPaterno: usuario.apellidoPaterno,
                apellidoMaterno: usuario.apellidoMaterno,
                foto: usuario.foto,
                puesto: usuario.puesto,
                rendimientoActual: {
                    resultadoObjetivos: usuario.rendimientoActual.resultadoObjetivos,
                    resultadoCompetencias: usuario.rendimientoActual.resultadoCompetencias,
                    resultadoFinal: usuario.rendimientoActual.resultadoFinal,
                    bono: usuario.rendimientoActual.bono
                },
                rendimientoAnterior: {
                    resultadoObjetivos: usuario.rendimientoAnterior.resultadoObjetivos,
                    resultadoCompetencias: usuario.rendimientoAnterior.resultadoCompetencias,
                    resultadoFinal: usuario.rendimientoAnterior.resultadoFinal,
                    bono: usuario.rendimientoAnterior.bono
                }
            })
        )}))
}