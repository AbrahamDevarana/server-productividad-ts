import Sequelize from "sequelize";
import database from "../../config/database";


export const OperativoHistory = database.define('history_operativo', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true        
    },
    nombre: {
        type: Sequelize.STRING,
        allowNull: false
    },
    meta: {
        type: Sequelize.TEXT,
        allowNull: true
    },
    indicador: {
        type: Sequelize.TEXT,
        allowNull: true
    },
    tacticoId: {
        type: Sequelize.UUID,
        allowNull: true,
    },
    fechaInicio: {
        type: Sequelize.DATE,
        allowNull: false
    },
    fechaFin: {
        type: Sequelize.DATE,
        allowNull: false
    },
    quarter: {
        type: Sequelize.SMALLINT,
        allowNull: true
    },
    year: {
        type: Sequelize.SMALLINT,
        allowNull: true
    },
    idOperativo: {
        type: Sequelize.UUID,
        allowNull: true
    },
    status: {
        type: Sequelize.STRING,
        allowNull: true
    },
    createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
    updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
},
{
    paranoid: true,
    timestamps: true,
    tableName: 'history_operativo'
});
