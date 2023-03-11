import Sequelize from "sequelize";
import database from "../config/database";
import { Usuarios } from "./Usuarios";

export const Direccion = database.define('direccion', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    calle: {
        type: Sequelize.STRING,
        allowNull: false
    },
    numeroExterior: {
        type: Sequelize.STRING,
        allowNull: false
    },
    numeroInterior: {
        type: Sequelize.STRING,
    },
    colonia: {
        type: Sequelize.STRING,
        allowNull: false
    },
    codigoPostal: {
        type: Sequelize.STRING,
        allowNull: false
    },
    ciudad: {
        type: Sequelize.STRING,
        allowNull: false
    },
    estado: {
        type: Sequelize.STRING,
        allowNull: false
    },
}, {
    timestamps: true,
    paranoid: true,
    hooks: {
        beforeCreate: async (direccion: any) => {
            
        },
        beforeUpdate: async (direccion: any) => {
            direccion.updatedAt = new Date();
        },
    },
    defaultScope: {
        attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
    },
});

