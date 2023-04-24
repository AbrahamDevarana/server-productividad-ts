import Sequelize from "sequelize";
import database from "../../config/database";

export const PivotAcciones = database.define('pivot_acciones', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    accionId: {
        type: Sequelize.UUID,
        allowNull: false,
    },
    accionableId: {
        type: Sequelize.UUID,
        allowNull: false,
    },
    accionable: {
        type: Sequelize.STRING,
        allowNull: false,
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
    timestamps: true,
});

