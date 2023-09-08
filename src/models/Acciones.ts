import Sequelize, { Model } from "sequelize";
import database from "../config/database";
import { ResultadosClave } from "./ResultadoClave";
import { PivotOpUsuario } from "./pivot/PivotOperativoUsuario";


export interface AccionAttributes {
    id?: string;
    nombre: string;
    descripcion?: string;
    status: number;
    resultadoClaveId: string;
    propietarioId: string;
    fechaInicio: Date;
    fechaFin: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface AccionInstance extends Model<AccionAttributes>, AccionAttributes {}


export const Acciones = database.define<AccionInstance>('acciones', {
    id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
    },
    nombre: {
        type: Sequelize.STRING,
        allowNull: false
    },
    descripcion: {
        type: Sequelize.STRING,
    },
    status: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    resultadoClaveId: {
        type: Sequelize.UUID,
        allowNull: false
    },
    propietarioId: {
        type: Sequelize.UUID,
        allowNull: false
    },
    fechaInicio: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
    fechaFin: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
    createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
    updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
}, {
    paranoid: true,
    timestamps: true,
    hooks: {
        afterUpdate: async (accion: AccionInstance) => {
            await updateProgreso(accion);
        },
        afterDestroy: async (accion: AccionInstance) => {
            await updateProgreso(accion);
        },
        afterCreate: async (accion: AccionInstance) => {
            await updateProgreso(accion);
        }



    },
    defaultScope: {
        attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
    },
});



const updateProgreso = async (accion: AccionInstance) => {
    
        const resultadoClave = await ResultadosClave.findOne({
            where: {
                id: accion.resultadoClaveId
            }
        });
        
        const acciones = await Acciones.findAll({
            where: {
                resultadoClaveId: accion.resultadoClaveId
            }
        });


        if(resultadoClave){
            if(resultadoClave.tipoProgreso === 'acciones'){
               
                let accionesCompletadas = 0;
                let accionesTotales = 0;

                acciones.forEach(accion => {
                    if(accion.status === 1){
                        accionesCompletadas++;
                    }
                    accionesTotales++;
                })

                const progresoTotal = accionesCompletadas/accionesTotales * 100

                await resultadoClave.update({ progreso: progresoTotal });

            }

           await updateProgresoResultadoClave({objetivoOperativoId: resultadoClave.operativoId});
        }
}


export const updateProgresoResultadoClave = async ({objetivoOperativoId}: any) => {

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

// const updateDate = async (accion: AccionInstance) => {

//     const resultadoClave = await ResultadosClave.findOne({
//         where: {
//             id: accion.resultadoClaveId
//         }
//     })

//     if(resultadoClave){
//         if(accion.fechaFin > resultadoClave.fechaFin){
//             await resultadoClave.update({ fechaFin: accion.fechaFin });
//         }
//         // Obtener todos las acciones del resultado clave si la fechaFin de todas las acciones el menor al ultimo día del cuatrimestre en el que se encuentra el resultado clave, actualizar la fechaFin del resultado clave a ul ultimo día del cuatrimestre en el que se encuentra el resultado clave


//         const acciones = await Acciones.findAll({
//             where: {
//                 resultadoClaveId: accion.resultadoClaveId
//             }
//         });

//         let fechaInicio = dayjs(resultadoClave.fechaInicio);
//         let ultimoDiaCuatrimestre = fechaInicio.endOf('quarter').toDate();    

//         if (acciones.every(accion => accion.fechaFin < ultimoDiaCuatrimestre)){
//             await resultadoClave.update({ fechaFin: ultimoDiaCuatrimestre });
//         }
//     }

// }