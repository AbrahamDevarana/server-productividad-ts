

import Sequelize from "sequelize";
import database from "../../config/database";


export const PivotProyectoUsuarios = database.define('pivot_proyecto_usuarios', {
    proyectoId: {
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