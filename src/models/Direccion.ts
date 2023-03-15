import Sequelize from "sequelize";
import database from "../config/database";

export const Direccion = database.define('direcciones', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    calle: {
        type: Sequelize.STRING,
        allowNull: true
    },
    numeroExterior: {
        type: Sequelize.STRING,
        allowNull: true
    },
    numeroInterior: {
        type: Sequelize.STRING,
    },
    colonia: {
        type: Sequelize.STRING,
        allowNull: true
    },
    codigoPostal: {
        type: Sequelize.STRING,
        allowNull: true
    },
    ciudad: {
        type: Sequelize.STRING,
        allowNull: true
    },
    estado: {
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
}, {
    paranoid: true,
    timestamps: true,
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

