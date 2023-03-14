import Sequelize from "sequelize";
import database from "../config/database";

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
        }
    }
});


