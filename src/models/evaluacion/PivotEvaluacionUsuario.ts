import Sequelize, { InferAttributes, InferCreationAttributes, Model } from "sequelize";
import database from "../../config/database";



export interface EvaluacionUsuarioModelProps extends Model<InferAttributes<EvaluacionUsuarioModelProps>, InferCreationAttributes<EvaluacionUsuarioModelProps>> {
    id?: number;
    evaluadorId: string;
    evaluadoId: string;
    evaluacionId: number;
    year: number;
    quarter: number;
    evaluador?: any;
    status?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export const AsignacionEvaluacion = database.define<EvaluacionUsuarioModelProps>(
    "pivot_evaluacion_usuario",
    {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        evaluadorId: {
            type: Sequelize.UUID,
            allowNull: false,
        },
        evaluadoId: {
            type: Sequelize.UUID,
            allowNull: false,
        },
        evaluacionId: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        status: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        year: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        quarter: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
    },
    {
        tableName: "pivot_evaluacion_usuario",
        paranoid: true,
        timestamps: true,
        hooks: {},
        defaultScope: {
            attributes: { exclude: ["createdAt", "updatedAt, deletedAt"] },
        },
    },
);
