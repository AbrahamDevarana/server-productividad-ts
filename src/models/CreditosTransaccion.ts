import Sequelize, { InferAttributes, InferCreationAttributes, Model } from "sequelize";
import database from "../config/database";
import { v4 as uuidv4 } from 'uuid';


export interface CreditosTransaccionModel extends Model<InferAttributes<CreditosTransaccionModel>, InferCreationAttributes<CreditosTransaccionModel>> {

    id?: number;
    tipo_transaccion: string;
    monto: number;
    descripcion: string;
    createdAt?: Date;
    updatedAt?: Date;
}


export const Creditos = database.define<CreditosTransaccionModel>('creditos_transaccion', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    tipo_transaccion: {
        type: Sequelize.STRING,
        allowNull: false
    },
    monto: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
    },
    descripcion: {
        type: Sequelize.STRING,
        allowNull: true
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
    paranoid: true,
    timestamps: true,
    hooks: {     
    },
    defaultScope: {
        attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
    },
});


