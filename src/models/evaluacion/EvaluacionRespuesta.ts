import Sequelize from "sequelize";
import database from "../../config/database";

export const EvaluacionRespuesta = database.define(
    "evaluacion_respuesta",
    {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        resultado: {
            type: Sequelize.FLOAT(2),
            allowNull: false,
            validate: {
                min: 0,
                max: 5,
            },
        },
        comentario: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        status: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        evaluacionId: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        evaluacionPreguntaId: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        createdAt: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW,
        },
        updatedAt: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW,
        },
    },
    {
        tableName: "evaluacion_respuesta",
        paranoid: true,
        timestamps: true,
        hooks: {},
        defaultScope: {
            attributes: { exclude: ["createdAt", "updatedAt, deletedAt"] },
        },
    },
);
