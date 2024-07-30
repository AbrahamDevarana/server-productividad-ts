import Sequelize, { InferAttributes, InferCreationAttributes, Model } from "sequelize";
import database from "../config/database";

export interface ListadoModel extends Model<InferAttributes<ListadoModel>, InferCreationAttributes<ListadoModel>> {
    id?: string;
    titulo?: string;
    descripcion?: string;
    fechaInicio?: Date;
    fechaFin?: Date;
    comiteId: string;
    color?: string;
    status?: 'SIN_INICIAR' | 'EN_PROCESO' | 'FINALIZADO' | 'CANCELADO' | 'DETENIDO' | 'RETRASADO';
    createdAt?: Date;
    updatedAt?: Date;
}

export const Listado = database.define('listado', {
    id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
    },
    titulo: {
        type: Sequelize.STRING,
        defaultValue: 'Nueva Sección...'
    },
    descripcion: {
        type: Sequelize.TEXT
    },
    fechaInicio: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
    fechaFin: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
    comiteId: {
        type: Sequelize.UUID,
        allowNull: false
    },
    color: {
        type: Sequelize.STRING(7),
        defaultValue: '#656A76'
    },
    status: {
        type: Sequelize.STRING(12),
        defaultValue: 'SIN_INICIAR'
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
        afterCreate: async (listado: ListadoModel) => {
        },
        afterUpdate: async (listado: ListadoModel) => {
        }
    },
    defaultScope: {
        attributes: { exclude: ['updatedAt', 'deletedAt'] }
    },
});
