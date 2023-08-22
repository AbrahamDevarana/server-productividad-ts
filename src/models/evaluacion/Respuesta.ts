import Sequelize from "sequelize";
import database from "../../config/database";

export const Respuesta = database.define(
    "evaluacion_respuesta",
    {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
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
            type: Sequelize.STRING,
            allowNull: true,
        },
    },
    {
        tableName: "evaluacion_respuesta",
        paranoid: true,
        timestamps: true,
        hooks: {},
    },
);
