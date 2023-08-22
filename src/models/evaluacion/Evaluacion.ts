import Sequelize from "sequelize";
import database from "../../config/database";

export const Evaluacion = database.define(
    "evaluacion",
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
        tableName: "evaluacion",
        paranoid: true,
        timestamps: true,
        hooks: {},
    },
);
