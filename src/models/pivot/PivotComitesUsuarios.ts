

import Sequelize from "sequelize";
import database from "../../config/database";


export const PivotComitesUsuarios = database.define('pivot_comites_usuarios', {
    comiteId: {
        type: Sequelize.UUID,
        allowNull: false,
    },
    usuarioId: {
        type: Sequelize.UUID,
        allowNull: false,
    },
}, {
    timestamps: true,
});