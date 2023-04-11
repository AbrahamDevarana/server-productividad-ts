import Sequelize from "sequelize";
import database from "../../config/database";


export const TacticosHistory = database.define('tacticos_history', {
    id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
    },
    tacticoId: {
        type: Sequelize.UUID,
        allowNull: false
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
    progreso: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    fechaInicio: {
        type: Sequelize.DATE,
        allowNull: true
    },
    fechaFin: {
        type: Sequelize.DATE,
        allowNull: true
    },
    status: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    tipoObjetivo: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1 // 1: Táctico, 2: Core
    },
    fechaCambio: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    }
    
});