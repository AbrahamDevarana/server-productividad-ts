import Sequelize, { InferAttributes, InferCreationAttributes, Model } from "sequelize";
import database from "../config/database";


export interface HistorialOperativo extends Model<InferAttributes<HistorialOperativo>, InferCreationAttributes<HistorialOperativo>> {
    
    id?: number;
    texto: string;
    operativoId: string;
    type: 'create' | 'update' | 'delete'
    createdAt?: Date;
    updatedAt?: Date;

}


export const ObjetivoOperativos = database.define<HistorialOperativo>('historial_operativo', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    texto: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    operativoId: {
        type: Sequelize.UUID,
        allowNull: false
    },
    type: {
        type: Sequelize.STRING,
    },
    createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
    updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
}, {
    timestamps: true,
    hooks: {
    },
    paranoid: true
});
