import Sequelize, { Model } from "sequelize";
import database from "../config/database";
import { v4 as uuidv4 } from 'uuid';

export interface ObjetivoOperativosAttributes {
  
    id?: string;
    nombre: string;
    meta?: string;
    indicador?: string;
    tacticoId?: string;
    fechaInicio: Date;
    fechaFin: Date;
    propietarioId?: string;
    quarter?: number;
    year?: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ObjetivosOperativosInstance extends Model<ObjetivoOperativosAttributes>, ObjetivoOperativosAttributes {
    operativo?: ObjetivosOperativosInstance;
}


export const ObjetivoOperativos = database.define<ObjetivosOperativosInstance>('obj_operativos', {
    id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: () => uuidv4()
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
    propietarioId: {
        type: Sequelize.UUID,
        allowNull: true
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
        afterUpdate: (objetivoOperativo: ObjetivosOperativosInstance, options) => {
         
        }  
    },
    defaultScope: {
        attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
    },
});
