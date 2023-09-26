import Sequelize, { InferAttributes, InferCreationAttributes, Model } from "sequelize";
import database from "../config/database";

interface HistorialPerformanceModel extends Model<InferAttributes<HistorialPerformanceModel>, InferCreationAttributes<HistorialPerformanceModel>> {
    id?: number;
    quarter: number;
    year: number;
    usuarioId: string;
    total: number;
    createdAt?: Date;
    updatedAt?: Date;

}


export const HistorialPerformance = database.define<HistorialPerformanceModel>('historial_performance', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    quarter: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    year: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    usuarioId: {
        type: Sequelize.UUID,
        allowNull: false,
    },
    total: {
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

}, {
    tableName: 'historial_performance',
    timestamps: true,
    paranoid: true,
    defaultScope:{
        attributes: {exclude: ['createdAt', 'updatedAt', 'deletedAt']}
    },
   
})
