import Sequelize from "sequelize";
import database from "../config/database";
import slugify from "slugify";

export const Areas = database.define('areas', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: Sequelize.STRING,
        allowNull: false
    },
    parentId: {
        type: Sequelize.INTEGER,
    },
    leaderId: {
        type: Sequelize.UUID,
    },
    slug:{
        type: Sequelize.STRING,
    },
    codigo: {
        type: Sequelize.STRING,
    },
    order: {
        type: Sequelize.INTEGER,
    },
    status: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
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
        beforeUpdate: async (area: any) => {
            area.updatedAt = new Date();
        },
        beforeCreate: async (area: any) => {
            area.slug = slugify(area.nombre, { lower: true });
        }
    },
    defaultScope: {
        attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
    },
});

