import Sequelize from "sequelize";
import database from "../config/database";

export const Tareas = database.define('tareas', {
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
        allowNull: true
    },
    status: {
        type: Sequelize.STRING(36),
        defaultValue: 'SIN_INICIAR'
    },
    propietarioId: {
        type: Sequelize.UUID,
        allowNull: false
    },
    hitoId: {
        type: Sequelize.UUID,
        allowNull: false
    },
    fechaInicio: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
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
        beforeUpdate: async (accion: any) => {
            accion.updatedAt = new Date();
        }
    },

    defaultScope: {
        attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
    },
});

