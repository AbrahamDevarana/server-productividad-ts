import Sequelize from "sequelize";
import database from "../../config/database";

export const PivotCoRespTask = database.define('pivot_co_responsables_task', {
    coResponsableId: {
        type: Sequelize.UUID,
        allowNull: false,
    },
    taskId: {
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
