import Sequelize from "sequelize";
import database from "../config/database";
import { ObjetivoOperativos } from "./Operativos";

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
        type: Sequelize.ENUM('ESTRATEGICO', 'CORE'),
        defaultValue: 'ESTRATEGICO'  
    },
    tipoProgreso: {
        type: Sequelize.ENUM('PROMEDIO', 'MANUAL'), // 1 = manual | 2 = % objetivos operativos
        defaultValue: 'PROMEDIO'
    },
    status: {
        type: Sequelize.STRING(12),
        allowNull: false,
        defaultValue: 'SIN_INICIAR'
    },
    activo: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
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
        afterUpdate: async (tactico: any) => {            
            tactico.updatedAt = new Date();
            if(tactico.tipoObjetivo == 'CORE') tactico.tipoProgreso = 1;
        },
        afterCreate: async (tactico: any) => {
            if(tactico.tipoObjetivo == 'CORE') tactico.tipoProgreso = 1;
            await tactico.save();
        },
    },
    defaultScope: {
        attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
    },
});
