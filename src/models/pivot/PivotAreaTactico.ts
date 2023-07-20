import Sequelize from "sequelize";
import database from "../../config/database";

export const PivotAreaTactico = database.define('pivot_area_tacticos', {
    areaId: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    tacticoId: {
        type: Sequelize.UUID,
        allowNull: false,
    },
    order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
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
    hooks: {
        beforeUpdate: async (pivotAreaTactico: any) => {
            pivotAreaTactico.updatedAt = new Date();
        }
    }
});
