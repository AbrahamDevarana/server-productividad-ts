import Sequelize from "sequelize";
import database from "../../config/database";

export const EvaluacionPregunta = database.define(
    "evaluacion_pregunta",
    {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        texto: {
            type: Sequelize.TEXT,
        },
        descripcion: {
            type: Sequelize.TEXT,
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
        tableName: "evaluacion_pregunta",
        paranoid: true,
        timestamps: true,
        hooks: {},
        defaultScope: {
            attributes: { exclude: ["createdAt", "updatedAt, deletedAt"] },
        },
    },
);
