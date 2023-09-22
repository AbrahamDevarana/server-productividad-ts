import Sequelize, { InferAttributes, InferCreationAttributes, Model } from "sequelize";
import database from "../../config/database";


export interface OperativoModel extends Model<InferAttributes<OperativoModel>, InferCreationAttributes<OperativoModel>> {
    id?: string;
    nombre?: string;
    meta?: string;
    indicador?: string;
    tacticoId?: string;
    fechaInicio?: Date;
    fechaFin?: Date;
    quarter?: number;
    year?: number;
    status?: 'ABIERTO' | 'PENDIENTE_APROBACION' | 'APROBADO' | 'SIN_APROBAR' | 'CANCELADO' | 'FINALIZADO';
    idOperativo?: string;
    modifiedBy: string;
    createdAt?: Date;
    updatedAt?: Date;
}


export const OperativoHistory = database.define<OperativoModel>('history_operativo', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true        
    },
    nombre: {
        type: Sequelize.STRING,
        allowNull: false
    },
    meta: {
        type: Sequelize.TEXT,
        allowNull: true
    },
    indicador: {
        type: Sequelize.TEXT,
        allowNull: true
    },
    tacticoId: {
        type: Sequelize.UUID,
        allowNull: true,
    },
    fechaInicio: {
        type: Sequelize.DATE,
        allowNull: false
    },
    fechaFin: {
        type: Sequelize.DATE,
        allowNull: false
    },
    quarter: {
        type: Sequelize.SMALLINT,
        allowNull: true
    },
    year: {
        type: Sequelize.SMALLINT,
        allowNull: true
    },
    idOperativo: {
        type: Sequelize.UUID,
        allowNull: true
    },
    status: {
        type: Sequelize.STRING,
        allowNull: true
    },
    modifiedBy: {
        type: Sequelize.UUID,
    },
    createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
    updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
},
{
    paranoid: true,
    timestamps: true,
    tableName: 'history_operativo',
    hooks: {
        afterCreate: async () => {
           
        }
    }
});
