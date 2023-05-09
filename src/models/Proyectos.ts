import Sequelize from "sequelize";
import database from "../config/database";


export const Proyectos = database.define('proyectos', {
    id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
    },
    titulo: {
        type: Sequelize.STRING,
        allowNull: false
    },
    descripcion: {
        type: Sequelize.TEXT,
        allowNull: true
    },
    icono: {
        type: Sequelize.TEXT,
        allowNull: true
    },
    imagen: {
        type: Sequelize.TEXT,
        allowNull: true
    },
    fechaInicio: {
        type: Sequelize.DATE,
        allowNull: true
    },
    fechaFin: {
        type: Sequelize.DATE,
        allowNull: true
    },
    propietarioId: {
        type: Sequelize.UUID,
        allowNull: false
    },
    status: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
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
        beforeUpdate: async (proyecto: any) => {
        }
    },
    defaultScope: {
        attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
    },
});



