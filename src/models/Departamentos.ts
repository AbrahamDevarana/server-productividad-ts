import Sequelize from "sequelize";
import database from "../config/database";
import slugify from "slugify";

export const Departamentos = database.define('departamentos', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: Sequelize.STRING,
        allowNull: false
    },
    areaId: {
        type: Sequelize.INTEGER,
    },
    leaderId: {
        type: Sequelize.UUID,
        allowNull: true
    },
    status: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    slug:{
        type: Sequelize.STRING,
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
        beforeUpdate: async (departamento: any) => {
            departamento.updatedAt = new Date();
            departamento.slug = slugify(departamento.nombre, { lower: true });
        },
        beforeCreate: async (departamento: any) => {
            departamento.slug = slugify(departamento.nombre, { lower: true });
        },
    }
});

