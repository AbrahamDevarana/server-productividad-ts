
import Sequelize, { InferAttributes, InferCreationAttributes, Model } from "sequelize";
import database from "../config/database";
import { ComitesProps } from "../interfaces/";

export interface ComiteModel extends Model<InferAttributes<ComiteModel>, InferCreationAttributes<ComiteModel>>, ComitesProps {

}
    
export const Comites = database.define('comites', {
    id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
    },
    titulo: {
        type: Sequelize.STRING,
        allowNull: false
    },
    descripcion: {
        type: Sequelize.TEXT,
    },
    icono: {
        type: Sequelize.TEXT,
    },
    imagen: {
        type: Sequelize.TEXT,
    },
    fechaInicio: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
    fechaFin: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
    propietarioId: {
        type: Sequelize.UUID,
        allowNull: false
    },
    status: {
        type: Sequelize.ENUM('SIN_INICIAR', 'EN_PROCESO', 'FINALIZADO', 'CANCELADO', 'DETENIDO', 'RETRASADO'),
        defaultValue: 'SIN_INICIAR'
    },
    order: {
        type: Sequelize.INTEGER,
        defaultValue: 0
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
        beforeUpdate: async (proyecto: any) => {
        }
    },
    defaultScope: {
        attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
    },
});



