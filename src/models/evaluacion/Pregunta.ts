import Sequelize from "sequelize";
import database from "../../config/database";

export const Pregunta = database.define(
    "evaluacion_pregunta",
    {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
        },
        nombre: {
            type: Sequelize.STRING,
        },
        descripcion: {
            type: Sequelize.STRING,
        },
    },
    {
        tableName: "evaluacion_pregunta",
        paranoid: true,
        timestamps: true,
        hooks: {},
    },
);
