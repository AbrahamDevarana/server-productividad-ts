import { ResultadoClaveModel, ResultadosClave } from "../models/ResultadoClave";


interface Props {
    propietarioId: string;
    operativoId: string;
    firstDay: Date;
    lastDay: Date;
}


export const createKeyResultService = async (data: Props): Promise<ResultadoClaveModel> => {
    const { propietarioId, operativoId, firstDay, lastDay } = data;
    return await ResultadosClave.create({
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
}

export const deleteKeyResultService = async (resultadoClaveId: string | string[]): Promise<boolean> => {
    return await ResultadosClave.destroy({
        where: {
            id: resultadoClaveId
        }
    }).then(() => true);
}
