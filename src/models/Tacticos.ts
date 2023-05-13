import Sequelize from "sequelize";
import database from "../config/database";

export const Tacticos = database.define('obj_tacticos', {
    id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
    },
    nombre: {
        type: Sequelize.STRING,
        allowNull: false
    },
    codigo: {
        type: Sequelize.STRING,
        allowNull: true
    },
    meta: {
        type: Sequelize.TEXT,
        allowNull: true
    },
    indicador: {
        type: Sequelize.TEXT,
        allowNull: true
    },
    progreso: { // avance
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    fechaInicio: {
        type: Sequelize.DATE,
        allowNull: false
    },
    fechaFin: {
        type: Sequelize.DATE,
        allowNull: false
    },
    propietarioId: {
        type: Sequelize.UUID,
        allowNull: true
    },
    estrategicoId: {
        type: Sequelize.UUID,
        allowNull: true
    },
    tipoProgreso: {
        type: Sequelize.INTEGER,
        defaultValue: 1
    },

    trimestres: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    objetivoPadre: { // Objetivo Táctico Dividido por Trimestres 
        type: Sequelize.UUID,
        allowNull: true,  
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
        afterUpdate: async (tactico: any) => {
           
        }
    },
    defaultScope: {
        attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
    },
});
