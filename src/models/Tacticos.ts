import Sequelize from "sequelize";
import database from "../config/database";
import Trimestre from "./custom/Trimestre";
import { Areas } from "./Areas";

export const Tacticos = database.define('obj_tacticos', {
    id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
    },
    nombre: {
        type: Sequelize.STRING,
    },
    codigo: {
        type: Sequelize.STRING,
    },
    meta: {
        type: Sequelize.TEXT,
    },
    indicador: {
        type: Sequelize.TEXT,
    },
    progreso: { // avance
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    fechaInicio: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
    fechaFin: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
    propietarioId: {
        type: Sequelize.UUID,
    },
    estrategicoId: {
        type: Sequelize.UUID,
        allowNull: true
    },
    // tipoObjetivo = enum estrategico/core
    tipoObjetivo:{
        type: Sequelize.ENUM('estrategico', 'core'),
        defaultValue: 'estrategico'  
    },
    tipoProgreso: {
        type: Sequelize.INTEGER, // 1 = manual | 2 = % objetivos operativos
        defaultValue: 1
    },
    status: {
        type: Sequelize.STRING(12),
        allowNull: false,
        defaultValue: 'SIN_INICIAR'
    },
    createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
    updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    }
},{
    paranoid: true,
    timestamps: true,
    hooks: {
        beforeUpdate: async (tactico: any) => {
            tactico.updatedAt = new Date();
        },
        afterCreate: async (tactico: any) => {
       
        },
    },
    defaultScope: {
        attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
    },
});
