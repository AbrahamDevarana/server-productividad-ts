import Sequelize from "sequelize";
import database from "../../config/database";

export const PivotEvaluacionUsuario = database.define('pivot_evaluacion_usuario', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    evaluacionId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    usuarioId: {
        type: Sequelize.STRING,
        allowNull: false
    },
    evaluadorId: {
        type: Sequelize.STRING,
        allowNull: false
    },
    comentarios: {
        type: Sequelize.TEXT,        
    },
    calificacion: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
    },
    quarter: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    year: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
    },
    updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
    },
}, {
    timestamps: true,
    paranoid: true,
    defaultScope:{
        attributes: {exclude: ['createdAt', 'updatedAt', 'deletedAt']}
    }
});



