
import Sequelize from "sequelize";
import database from "../../config/database";


export const PivotEstrResp = database.define('pivot_estr_resp', {
    objEstrategicoId: {
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

    
    