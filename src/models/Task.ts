import Sequelize, { InferAttributes, InferCreationAttributes, Model } from "sequelize";
import database from "../config/database";
import { ResultadosClave } from "./ResultadoClave";
import { PivotOpUsuario } from "./pivot/PivotOperativoUsuario";

export interface TaskModel extends Model<InferAttributes<TaskModel>, InferCreationAttributes<TaskModel>> {
    
    id?: number;
    nombre: string;
    descripcion?: string;
    taskeableId: string;
    taskeableType: 'RESULTADO_CLAVE' | 'HITO'
    prioridad: 'ALTA' | 'MEDIA' | 'BAJA' | 'CRÍTICA'
    status: 'SIN_INICIAR' | 'EN_PROCESO' | 'FINALIZADO' | 'CANCELADO' | 'DETENIDO' | 'RETRASADO';
    progreso: number;
    propietarioId: string;
    fechaFin: Date;
    visible?: boolean;
    created?: Date;
    createdAt?: Date;
    updatedAt?: Date;


    getTaskResultadoClave: () => any;
    setTaskResultadoClave: (resultadoClave: any) => void;
    createTaskResultadoClave: (resultadoClave: any) => void;
    addCoResponsables: (coResponsable: any) => void;
    removeCoResponsables: (coResponsable: any) => void;
    setCoResponsables: (coResponsables: any) => void;

}

export const Task = database.define('tasks', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: Sequelize.STRING,
        allowNull: false
    },
    descripcion: {
        type: Sequelize.STRING,
    },
    prioridad: {
        type: Sequelize.ENUM('ALTA', 'MEDIA', 'BAJA', 'CRÍTICA'),
        defaultValue: 'MEDIA'
    },
    status: {
        type: Sequelize.ENUM('SIN_INICIAR', 'EN_PROCESO', 'FINALIZADO', 'CANCELADO', 'DETENIDO', 'RETRASADO'),
        defaultValue: 'SIN_INICIAR'
    },
    progreso: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    propietarioId: {
        type: Sequelize.UUID,
        allowNull: false
    },
    fechaFin: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
    taskeableId: {
        type: Sequelize.UUID,
    },
    taskeableType: {
        type: Sequelize.TEXT,
    },
    visible: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
    },
    created:{
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
        afterFind: async (task: TaskModel) => {
            // if(Array.isArray(task)){
            //    console.log('tasks', task[0].__proto__);
               
            // }else{
            //     // @ts-ignore
            //     console.log('task', task.__proto__);
                
            // }
        },
            
        afterUpdate: async (task: TaskModel) => {
            await updateProgreso(task);
        },
        afterDestroy: async (task: TaskModel) => {
            await updateProgreso(task);
        },
        afterCreate: async (task: TaskModel) => {
            await updateProgreso(task);
        }
        
    },

    defaultScope: {
        attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
    },
});


const updateProgreso = async (task: TaskModel) => {

    const resultadoClave = await ResultadosClave.findOne({
        where: {
            id: task.taskeableId
        }
    });

   
    
    
    const acciones = await Task.findAll({
        where: {
            taskeableId: task.taskeableId,
            status: ['FINALIZADO', 'SIN_INICIAR', 'EN_PROCESO']
        }
    });


    if(resultadoClave){
        if(resultadoClave.tipoProgreso === 'acciones'){
        
            let accionesTotales = 0;
            let accionesProgreso = 0;

            acciones.forEach(accion => {
                
                if(accion.status !== 'CANCELADO'){
                    accionesProgreso += accion.progreso;
                    
                }
                accionesTotales++;
            })
        
            const progresoTotal = (accionesProgreso / accionesTotales).toFixed(2)
            await resultadoClave.update({ progreso: Number(progresoTotal) });

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