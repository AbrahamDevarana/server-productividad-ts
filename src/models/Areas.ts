import Sequelize from "sequelize";
import database from "../config/database";

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
        allowNull: true
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
        }
    }
});

