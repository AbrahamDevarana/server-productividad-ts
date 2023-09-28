import Sequelize, { InferAttributes, InferCreationAttributes, Model } from "sequelize";
import database from "../config/database";

export interface TaskModel extends Model<InferAttributes<TaskModel>, InferCreationAttributes<TaskModel>> {
    
    id?: number;
    nombre: string;
    descripcion?: string;
    taskeableId: string;
    taskeableType: string;
    prioridad: 'ALTA' | 'NORMAL' | 'BAJA';
    status: 'SIN_INICIAR' | 'EN_PROCESO' | 'FINALIZADA' | 'CANCELADA'
    propietarioId: string;
    fechaFin: Date;
    createdAt?: Date;
    updatedAt?: Date;


    getTaskResultadoClave: () => any;
    setTaskResultadoClave: (resultadoClave: any) => void;
    createTaskResultadoClave: (resultadoClave: any) => void;

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
        type: Sequelize.STRING(12),
        defaultValue: 'NORMAL'
    },
    status: {
        type: Sequelize.STRING(12),
        defaultValue: 'SIN_INICIAR'
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
        beforeUpdate: async (tarea: any) => {
            tarea.updatedAt = new Date();
        },
        afterUpdate: async (tarea: any) => {
            
        },
        afterCreate: async (tarea: any) => {

        }
        
    },

    defaultScope: {
        attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
    },
});

