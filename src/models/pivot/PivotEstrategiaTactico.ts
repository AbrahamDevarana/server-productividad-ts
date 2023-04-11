import Sequelize from "sequelize";
import database from "../../config/database";


export const PivotEstrTact = database.define('pivot_estr_tact', {
    objEstrategicoId: {
        type: Sequelize.UUID,
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
        beforeUpdate: async (pivotEstrTact: any) => {
            pivotEstrTact.updatedAt = new Date();
        }
    }
});
