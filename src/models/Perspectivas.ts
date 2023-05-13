import Sequelize from "sequelize";
import database from "../config/database";
import { v4 as uuidv4 } from 'uuid';

export const Perspectivas = database.define('perspectivas', {
    id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: () => uuidv4()
    },
    nombre: {
        type: Sequelize.STRING,
        allowNull: false
    },
    descripcion: {
        type: Sequelize.TEXT,
        allowNull: true
    },
    color: {
        type: Sequelize.STRING,
        allowNull: true
    },
    icono:{
        type: Sequelize.STRING,
        allowNull: true
    },
    orden:{
        type: Sequelize.INTEGER,
        allowNull: true,
        unique: 'orden'
    },
    status: {
        type: Sequelize.BOOLEAN,
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
        beforeUpdate: async (perspectiva: any) => {
            perspectiva.updatedAt = new Date();
        }
    },
    defaultScope: {
        attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
    },
});




        