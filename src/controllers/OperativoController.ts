import { Request, Response } from "express";
import { ObjetivoOperativos, Usuarios, ResultadosClave, PivotOpUsuario, Task } from "../models";
import dayjs from "dayjs";
import { Op } from "sequelize";


const includes = [
    {
        model: Usuarios,
        as: 'operativosResponsable',
        attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'iniciales', 'email', 'foto', 'slug', 'leaderId'],
        through: {
            attributes: ['propietario', 'progresoAsignado', 'progresoReal', 'extra', 'status'],
            as: 'scoreCard'
        },
        required: false
    },
    {
        model: ResultadosClave,
        as: 'resultadosClave',
        attributes: ['id', 'nombre', 'progreso', 'tipoProgreso', 'fechaInicio', 'fechaFin', 'operativoId', 'status'],
        required: false,
        include: [{
            model: Task,
            as: 'task',
            required: false,
            attributes: ['id', 'nombre', 'status', 'taskeableId', 'taskeableType', 'propietarioId'],
        }]
    }
]


export const getOperativos = async (req:any, res: Response) => {
    
    const { year, quarter, usuarioId } = req.query;
    try {
        const operativos = await ObjetivoOperativos.findAll({
            order: [['createdAt', 'ASC']],
            include: includes,
            where: {
                [Op.and]: [
                    {
                        year
                    },
                    {
                        quarter
                    },
                ]
            }
        });
      
        const filteredObjetivos = filtrarObjetivosUsuario(operativos, usuarioId)

        res.json({ operativos: filteredObjetivos });
    
    } catch (error) {
        console.log(error);
        
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const updateOperativo = async (req: Request, res: Response) => {
    const { id } = req.params;

    const { nombre, meta, indicador, fechaInicio, fechaFin, operativosResponsable = [] , tacticoId, propietarioId } = req.body;
    
    const fechaInicial = dayjs(fechaInicio).toDate();
    const fechaFinal = dayjs(fechaFin).toDate();

    try {
        const operativo = await ObjetivoOperativos.findByPk(id);
        if (!operativo) {
            return res.status(404).json({
                msg: `No existe un operativo`
            });
        }

        if (operativo.status === 'CERRADO') {
            return res.status(400).json({
                msg: `No se puede actualizar un objetivo cerrado`
            });
        }

        await operativo.update({
            nombre,
            meta,
            indicador,
            fechaInicio: fechaInicial,
            fechaFin: fechaFinal,
            tacticoId,
        });


        const setResponsables = new Set();

        // si propietarioId es arrray tomar el primer valor

        
        operativosResponsable.forEach( (responsable: string) => {
            setResponsables.add(responsable);
        });
        
        setResponsables.add( propietarioId );
        
        await operativo.setOperativosResponsable(Array.from(setResponsables));

        const responsablesLista = await PivotOpUsuario.findAll({
            where: {
                objetivoOperativoId: operativo.id
            }
        });

        for (const responsable of responsablesLista) {
            const propietarioValue = responsable.usuarioId === propietarioId;
        
            await responsable.update({
                propietario: propietarioValue,
            });
        }
        
        await operativo.reload( { include: includes } );

        res.json({operativo});
    
    } catch (error) {
        console.log(error);
        
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const createOperativo = async (req: Request, res: Response) => {
    
    const { nombre, meta, indicador, fechaInicio, fechaFin, operativosResponsable = [], tacticoId, quarter, year, propietarioId} = req.body;

    const fechaInicial = dayjs(fechaInicio).toDate();
    const fechaFinal = dayjs(fechaFin).toDate();

    try {

        const operativo = await ObjetivoOperativos.create({
            nombre,
            meta,
            indicador,
            fechaInicio: fechaInicial,
            fechaFin: fechaFinal,
            tacticoId,
            quarter,
            year
        });

        if(!operativo) return res.status(400).json({ msg: 'No se pudo crear el operativo' });
    
        const setResponsables = new Set();
        
        operativosResponsable.forEach( (responsable: string) => {
            setResponsables.add(responsable);
        });

        setResponsables.add(propietarioId);

    
        await operativo.setOperativosResponsable(Array.from(setResponsables));
        
        const responsablesLista = await PivotOpUsuario.findAll({
            where: {
                objetivoOperativoId: operativo.id
            }
        });

        for (const responsable of responsablesLista) {
            const propietarioValue = responsable.usuarioId === propietarioId;
        
            await responsable.update({
                propietario: propietarioValue,
            });
        }
    
        // Crear resultado clave con 3 tasks

       if(operativo.id){

            const { year, quarter } = operativo;

            const firstDay = dayjs().year(year).quarter(quarter).startOf('quarter').toDate();
            const lastDay = dayjs().year(year).quarter(quarter).endOf('quarter').subtract(1, 'day').toDate();
            const resultadoClave = await ResultadosClave.create({
                nombre: operativo.nombre,
                fechaInicio: firstDay,
                fechaFin: lastDay,
                operativoId: operativo.id,
                status: 'SIN_INICIAR',
                tipoProgreso: 'acciones',
                progreso: 0,
                propietarioId: propietarioId,
                color: 'rgba(101, 106, 118, 1)'
            })

            if(!resultadoClave) return res.status(400).json({ msg: 'No se pudo crear el resultado clave' });

            await resultadoClave.reload();

            const nombres = ['Acción 1', 'Acción 2'];
            
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

        }

        await operativo.reload( { include: includes });

        res.json({operativo});
    
    } catch (error) {
        console.log(error);
        
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const deleteOperativo = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const operativo = await ObjetivoOperativos.findByPk(id);
        if (!operativo) {
            return res.status(404).json({
                msg: `No existe un operativo con el id ${id}`
            });
        }

        await operativo.destroy();

        res.json(operativo);
    
    } catch (error) {
        console.log(error);
        
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const getOperativo = async (req: Request, res: Response) => {

    
    const { id } = req.params;

    try {
        const operativo = await ObjetivoOperativos.findByPk(id, {
            include: includes
        });
        if (!operativo) {
            return res.status(404).json({
                msg: `No existe un operativo con el id ${id}`
            });
        }

        res.json({operativo});
    
    } catch (error) {
        console.log(error);
        
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

const filtrarObjetivosUsuario = (objetivos: any[], id: string) => {
    // id or slug
    const objetivoId = objetivos.filter( (obj: any) => obj.operativosResponsable.some( (res: any) => res.id === id));
    if(objetivoId.length > 0) return objetivoId;
    
    const objetivoSlug = objetivos.filter( (obj: any) => obj.operativosResponsable.some( (res: any) => res.slug === id));
    return objetivoSlug;
}

export const setPonderaciones = async (req: Request, res: Response) => {
    const {id} = req.params;
    const { ponderaciones} = req.body;

    try {



        ponderaciones.forEach( async (ponderacion: any) => {
                const { objetivoId, progresoAsignado } = ponderacion;

                const pivot = await PivotOpUsuario.findOne({
                    where: {
                        usuarioId: id,
                        objetivoOperativoId: objetivoId
                    }
                });

                if (pivot) {
                    await pivot.update({
                        progresoAsignado
                    });
                }
        });

        return res.json({
            ok: true,
            ponderaciones,
            usuarioId: id
        })
        
    } catch (error) {
        console.log(error);

        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });
        
    }
}

export const cerrarObjetivo = async (req: Request, res: Response) => {

    const { id } = req.params;


    try {
        const objetivo = await ObjetivoOperativos.findByPk(id);

        if(!objetivo) return res.status(404).json({ msg: 'No existe un este objetivo' });
        if(objetivo.status === 'CERRADO') return res.status(400).json({ msg: 'Este objetivo ya esta cerrado' });

        await objetivo.update({
            status: 'CERRADO'
        });

        // buscar los pivotOpUsuario y actualizarlos a cerrado

        const pivotOpUsuario = await PivotOpUsuario.findAll({
            where: {
                objetivoOperativoId: objetivo.id,
                status: 'ABIERTO'
            }
        });

        for (const pivot of pivotOpUsuario) {
            await pivot.update({
                status: 'PENDIENTE_APROBACION'
            });
        }

        await objetivo.reload({
            include: includes
        });

        res.json({
            ok: true,
            objetivo: {
                id: objetivo.id,
                status: objetivo.status,
            }
        })

    } catch (error) {
        console.log(error);

        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });
    }

}

// Recologar
export const cerrarPeriodo = async (req: Request, res: Response) => {
    const { year, quarter } = req.body;

    try {
        const operativos = await ObjetivoOperativos.findAll({
            where: {
                year,
                quarter
            }
        });

        for (const operativo of operativos) {
            await operativo.update({
                status: 'CERRADO'
            });
        }

        res.json({
            ok: true,
            operativos
        })
        
    } catch (error) {
        console.log(error);

        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });
        
    }
}

