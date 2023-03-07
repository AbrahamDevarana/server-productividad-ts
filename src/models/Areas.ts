import Sequelize from "sequelize";
import database from "../config/database";
import { Usuarios } from './Usuarios';

export const Areas = database.define('Areas', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: Sequelize.STRING,
        allowNull: false

    },
    // Apunta al area padre
    parentId: {
        type: Sequelize.INTEGER,
    },
    status: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    }
}, {
    paranoid: true,
    hooks: {
        beforeUpdate: async (area: any) => {
            area.updatedAt = new Date();
        }
    }
});

Areas.hasMany(Areas, { as: 'subAreas', foreignKey: 'parentId' });



