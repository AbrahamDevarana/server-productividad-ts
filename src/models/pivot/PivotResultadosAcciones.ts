import Sequelize from "sequelize";
import database from "../../config/database";

export const PivotResultadosAcciones = database.define('pivot_resultados_acciones', {
    resultadoClaveId: {
        type: Sequelize.UUID,
        allowNull: false,
    },
    accionId: {
        type: Sequelize.UUID,
        allowNull: false,
    },
}, {
    timestamps: true,
});
