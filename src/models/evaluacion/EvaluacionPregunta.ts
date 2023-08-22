import Sequelize from "sequelize";
import database from "../../config/database";

export const EvaluacionPregunta = database.define(
    "evaluacion_pregunta",
    {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
        },
        evaluacionId: {
            type: Sequelize.INTEGER,
        },
        preguntaId: {
            type: Sequelize.INTEGER,
        },
    },
    {
        tableName: "evaluacion_pregunta",
        paranoid: true,
        timestamps: true,
        hooks: {},
    },
);
