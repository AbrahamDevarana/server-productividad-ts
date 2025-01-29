import { Task, TaskModel } from "../models/Task";

interface Props {
    propietarioId: string;
    taskeableId: string;
    taskeableType: 'RESULTADO_CLAVE' | 'HITO' | 'LISTADO'
    nombre: string;
    fechaFin: Date;
}

export const createTaskService = async (data: Props): Promise<TaskModel> => {
    const { propietarioId, taskeableId, taskeableType , nombre, fechaFin } = data;
    return await Task.create({
        nombre,
        propietarioId,
        taskeableId: taskeableId,
        taskeableType: 'RESULTADO_CLAVE',
        prioridad: 'MEDIA',
        status: 'SIN_INICIAR',
        progreso: 0,
        fechaFin: fechaFin,
    });
}