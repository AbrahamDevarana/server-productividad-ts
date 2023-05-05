import Sequelize from "sequelize";
import database from "../../config/database";

export const PivotTareasResponsables = database.define('pivot_tareas_responsables', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    tareaId: {
        type: Sequelize.UUID,
        allowNull: false,
    },
    responsableId: {
        type: Sequelize.UUID,
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

