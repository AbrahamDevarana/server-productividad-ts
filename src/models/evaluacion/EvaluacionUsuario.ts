import Sequelize from "sequelize";
import database from "../../config/database";

export const EvaluacionUsuario = database.define(
    "evaluacion_usuario",
    {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
        },
        evaluadorId: {
            type: Sequelize.UUID,
            allowNull: false,
        },
        evaluadoId: {
            type: Sequelize.UUID,
            allowNull: false,
        },
    },
    {
        tableName: "evaluacion_usuario",
        paranoid: true,
        timestamps: true,
        hooks: {},
    },
);
