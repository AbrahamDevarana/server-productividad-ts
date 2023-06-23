import Sequelize from "sequelize";
import database from "../config/database";
import { v4 as uuidv4 } from 'uuid';

export const ObjetivoEstrategico = database.define('obj_estrategico', {
    id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: () => uuidv4()
    },
    nombre: {
        type: Sequelize.STRING,
        defaultValue: 'Nuevo Objetivo Estrategico'
    },
    codigo: {
        type: Sequelize.STRING,
    },
    descripcion: {
        type: Sequelize.TEXT,
    },
    indicador: {
        type: Sequelize.TEXT,
    },
    progreso: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    propietarioId: {
        type: Sequelize.UUID,
        allowNull: false
    },
    fechaInicio: {
        type: Sequelize.DATE,
    },
    fechaFin: {
        type: Sequelize.DATE,
    },
    perspectivaId: {
        type: Sequelize.UUID,
        allowNull: false
    },
    status: {
        type: Sequelize.STRING(12),
        defaultValue: 'SIN_INICIAR'
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
        beforeUpdate: async (objetivoEstrategico: any) => {
            objetivoEstrategico.updatedAt = new Date();
        }
    },
    defaultScope: {
        attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
    },
});





