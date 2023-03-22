import Sequelize from "sequelize";
import database from "../../config/database";

export const PivotPerspEstr = database.define('pivot_persp_estr', {
    objEstrategicoId: {
        type: Sequelize.UUID,
        allowNull: false,
    },
    perspectivaId: {
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
        beforeUpdate: async (pivotEstrPersp: any) => {
            pivotEstrPersp.updatedAt = new Date();
        },
        afterCreate: async (pivotEstrPersp: any) => {
            // order = order + 1
            const order = await PivotPerspEstr.count();
            pivotEstrPersp.order = order + 1;
        }
    }
});
