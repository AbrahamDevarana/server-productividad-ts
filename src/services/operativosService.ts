import { IncludeOptions } from "sequelize";
import { ObjetivoOperativos, Usuarios, ResultadosClave, PivotOpUsuario, Task, Tacticos, ObjetivoEstrategico, Departamentos, Comentarios } from "../models";
import { ObjetivosOperativosModel } from "../models/Operativos";
import dayjs from "dayjs";
import { updateProgresoObjetivo } from "../controllers/ResultadosController";
import { createKeyResultService, createTaskService } from "./";

interface Props extends ObjetivosOperativosModel {
    propietarioId: string;
}

interface CierreCicloInput {
    usuarioId: string;
    year: number;
    quarter: number;
    objetivosId: string[];
}

export interface Ponderacion {
    objetivoId: string;
    nombreObjetivo: string;
    progresoAsignado: number;
    propietario: boolean;
}


const getIncludes = (): IncludeOptions[] => {

    return [
        {   
            model: Usuarios,
            as: 'operativosResponsable',
            attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'iniciales', 'email', 'foto', 'slug', 'leaderId'],
            through: {
                attributes: ['propietario', 'progresoAsignado', 'progresoReal', 'extra', 'status', 'usuarioId'],
                as: 'scoreCard',
            },
            include: [ {
                model: Departamentos,
                as: 'departamento',
                attributes: ['id', 'nombre', 'areaId'],   
            }]
        },
        {
            model: Tacticos,
            as: 'tacticoOperativo',
            attributes: ['id', 'estrategicoId', 'tipoObjetivo', 'departamentoId'],
            include: [{
                model: ObjetivoEstrategico,
                as: 'estrategico',
                attributes: ['id', 'perspectivaId']
            }, {
                model: Departamentos,
                as: 'departamentos',
                attributes: ['id', 'nombre', 'areaId'],
            }]
        },
        {
            model: ResultadosClave,
            as: 'resultadosClave',
            attributes: ['id', 'nombre', 'progreso', 'tipoProgreso', 'fechaInicio', 'fechaFin', 'operativoId', 'status', 'color'],
            required: false,
            include: [{
                model: Task,
                as: 'task',
                required: false,
                attributes: ['id', 'nombre', 'status', 'taskeableId', 'taskeableType', 'propietarioId', 'prioridad'],
                include: [ {
                    model: Usuarios,
                    as: 'propietario',
                    attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'iniciales', 'email', 'foto', 'slug', 'leaderId'],
                },
                {
                    model: Comentarios,
                    as: 'comentarios',
                    attributes: ['id'],
                    required: false,
                    where: {
                        comentableType: 'TASK',
                    },
                }
            ]
            },
            {
                model: Usuarios,
                as: 'propietario',
                attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'iniciales', 'email', 'foto', 'slug', 'leaderId'],
            },
           
        ]
        }
    ]
};

export const getUserObjetivesService = async ({year, quarter, usuarioId = ''}: {year: number, quarter: number, usuarioId?: string}):Promise<ObjetivosOperativosModel[]> => {
    
    return await ObjetivoOperativos.findAll({
        where: {
            year,
            quarter,
        },
        include:  {   
            model: Usuarios,
            as: 'operativosResponsable',
            attributes: ['id'],
            required: true,
            through: {
                attributes: ['usuarioId'],
                where: { usuarioId }
            },
        },
    });
};

export const getObjectivesService = async ({year, quarter, usuarioId = ''}: {year: number, quarter: number, usuarioId?: string}):Promise<ObjetivosOperativosModel[]> => {
    
    const listMyObjetives = await getUserObjetivesService({year, quarter, usuarioId});
    return await ObjetivoOperativos.findAll({
        where: {
            year,
            quarter,
            id: listMyObjetives.map( (obj: any) => obj.id)
        },
        include: getIncludes(),
    });
};

export const updateObjectiveService = async ({ id, data }: { id: string, data: Props }): Promise<ObjetivosOperativosModel> => {
    const { nombre, meta, indicador, fechaInicio, fechaFin, operativosResponsable = [], tacticoId, propietarioId } = data;

    const fechaInicial = dayjs(fechaInicio).toDate();
    const fechaFinal = dayjs(fechaFin).toDate();

    const operativo = await ObjetivoOperativos.findByPk(id);
    if (!operativo) {
        throw { status: 404, message: 'No existe un operativo' };
    }

    if (operativo.status === 'CERRADO') {
        throw { status: 400, message: 'No se puede actualizar un objetivo cerrado' };
    }

    // Actualizar datos del operativo
    await operativo.update({
        nombre,
        meta,
        indicador,
        fechaInicio: fechaInicial,
        fechaFin: fechaFinal,
        tacticoId,
    });

    await assignResponsablesToOperativo(operativo, operativosResponsable, propietarioId);

    // Actualizar progreso del objetivo
    await updateProgresoObjetivo({ objetivoOperativoId: operativo.id });

    // Recargar datos del operativo con relaciones
    return await operativo.reload({ include: getIncludes() });
};

export const createObjectiveService = async (data: Props): Promise<ObjetivosOperativosModel> => {
    const { nombre, meta, indicador, fechaInicio, fechaFin, operativosResponsable = [], tacticoId, propietarioId, year, quarter } = data;

    const fechaInicial = dayjs(fechaInicio).toDate();
    const fechaFinal = dayjs(fechaFin).toDate();


    const operativo = await ObjetivoOperativos.create({
        nombre,
        meta,
        indicador,
        fechaInicio: fechaInicial,
        fechaFin: fechaFinal,
        year,
        quarter,
        tacticoId: tacticoId !== '' ? tacticoId : null
    });

    if (!operativo) {
        throw { status: 400, message: 'No se pudo crear el operativo' };
    }

    // Asignar responsables
    await assignResponsablesToOperativo(operativo, operativosResponsable, propietarioId);

    // Crear resultado clave
    if (operativo.id) {
        const { year, quarter } = operativo;
        const firstDay = dayjs().year(year).quarter(quarter).startOf('quarter').toDate();
        const lastDay = dayjs().year(year).quarter(quarter).endOf('quarter').subtract(1, 'day').toDate();

        const resultadoClave = await createKeyResultService({
            propietarioId,
            operativoId: operativo.id,
            firstDay,
            lastDay
        })

        if (!resultadoClave) {
            throw { status: 400, message: 'No se pudo crear el resultado clave' };
        }

        // Crear tareas asociadas al resultado clave
        const nombres = ['Acción 1', 'Acción 2'];
        for (const nombre of nombres) {
            await createTaskService({
                propietarioId,
                taskeableId: resultadoClave.id!,
                nombre,
                fechaFin: lastDay,
                taskeableType: 'RESULTADO_CLAVE'
            })
        }
    }

    return await operativo.reload({ include: getIncludes() });
};

export const deleteObjectiveService = async (id: string): Promise<boolean> => {

    const operativo = await ObjetivoOperativos.findByPk(id);
    if (!operativo) {
        throw { status: 404, message: 'No existe un operativo' };
    }

    if (operativo.status === 'CERRADO') {
        throw { status: 400, message: 'No se puede eliminar un objetivo cerrado' };
    }

    await operativo.destroy();

    const pivot = await operativo.getOperativosResponsable();
    for (const p of pivot) {
        await p.destroy();
    }

    return true;

};

export const getObjectiveService = async (id: string): Promise<ObjetivosOperativosModel> => {
   const operativo = await ObjetivoOperativos.findByPk(id, {
         include: getIncludes()
    });

    if (!operativo) {
        throw { status: 404, message: 'No existe un operativo' };
    }

    return operativo;
};

export const updatePonderacionesService = async ( usuarioId: string, ponderaciones: Ponderacion[] ): Promise<Ponderacion[]> => {
    for (const { objetivoId, progresoAsignado } of ponderaciones) {
        if (!objetivoId || typeof progresoAsignado !== 'number') {
            throw new Error(`Datos inválidos en la ponderación: ${JSON.stringify({ objetivoId, progresoAsignado })}`);
        }

        const pivot = await PivotOpUsuario.findOne({
            where: {
                usuarioId,
                objetivoOperativoId: objetivoId,
            },
        });

        if (pivot) {
            await pivot.update({ progresoAsignado });
        }
    }

    return ponderaciones;
};

export const cierreCicloService = async (data: CierreCicloInput) => {

    const { usuarioId, year, quarter, objetivosId } = data;

    const objetivos = await getObjectivesService({ year, quarter, usuarioId });

    if (objetivos.length === 0) throw new Error('No se encontraron objetivos para el usuario');

    const objetivosCierre: string[] = objetivos.map((obj) => obj.id!);

    // PivotOpUsuario update

    const pivot = await PivotOpUsuario.findAll({
        where: {
            objetivoOperativoId: objetivosCierre,
            usuarioId
        },
    });

    for (const pivotItem of pivot) {

        await pivotItem.update({ status: 'CERRADO' });

        // Si, soy el propietario del objetivo, entonces debo buscar a los demás responsables y actualizar su progreso
        if (pivotItem.propietario) {
            const responsables = await PivotOpUsuario.findAll({
                where: {
                    objetivoOperativoId: pivotItem.objetivoOperativoId,
                    propietario: false
                },
            });

            for (const responsable of responsables) {
                await responsable.update({ progresoAsignado: pivotItem.progresoAsignado });
            }
        }
    }

    // ObjetivoOperativo update status
    await cierreObjetivoService(objetivosCierre);

    return true;
};

const assignResponsablesToOperativo = async (operativo: ObjetivosOperativosModel, responsables: string[], propietarioId: string) => {
    const setResponsables = new Set([...responsables, propietarioId]);
    await operativo.setOperativosResponsable(Array.from(setResponsables));

    const responsablesLista = await PivotOpUsuario.findAll({
        where: { objetivoOperativoId: operativo.id }
    });

    for (const responsable of responsablesLista) {
        const propietarioValue = responsable.usuarioId === propietarioId;
        await responsable.update({ propietario: propietarioValue });
    }
};

// Este servicio se encarga de cerrar un objetivo operativo una vez que todos los responsables han cerrado sus resultados clave
const cierreObjetivoService = async (id: string[]) => {
    const operativo = await ObjetivoOperativos.findAll({
        where: {
            id
        }
    });

    if (!operativo) {
        throw { status: 404, message: 'No existe un operativo' };
    }

    for (const objetivo of operativo) {
        const pivot = await PivotOpUsuario.findAll({
            where: {
                objetivoOperativoId: objetivo.id
            }
        });

        // si el pivot es del propietario pasar a cerrado, sino pasar a Pendiente autorizar
        for (const p of pivot) {
            if (p.propietario) {
                await p.update({ status: 'CERRADO' });
            } else {
                await p.update({ status: 'PENDIENTE_AUTORIZAR' });
            }
        }
        

        if (pivot.every( (p) => p.status === 'CERRADO')) {
            await objetivo.update({ status: 'CERRADO' });
        }
    }

    return true;
}