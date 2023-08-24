import Sequelize, { InferAttributes, InferCreationAttributes, Model } from "sequelize";
import database from "../../config/database";



export interface EvaluacionPreguntaModelProps extends Model<InferAttributes<EvaluacionPreguntaModelProps>, InferCreationAttributes<EvaluacionPreguntaModelProps>> {
    id?: number;
    evaluacionId: number;
    preguntaId: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export const PivotEvaluacionPregunta = database.define<EvaluacionPreguntaModelProps>(
    "pivot_evaluacion_pregunta",
    {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        evaluacionId: {
            type: Sequelize.INTEGER,
        },
        preguntaId: {
            type: Sequelize.INTEGER,
        },
    },
    {
        tableName: "pivot_evaluacion_pregunta",
        paranoid: true,
        timestamps: true,
        hooks: {},
        defaultScope: {
            attributes: { exclude: ["createdAt", "updatedAt, deletedAt"] },
        },
    },
);
