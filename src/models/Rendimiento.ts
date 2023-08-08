import Sequelize, { InferAttributes, InferCreationAttributes, Model } from "sequelize";
import database from "../config/database";





export interface RendimientoModel extends Model<InferAttributes<RendimientoModel>, InferCreationAttributes<RendimientoModel>> {
    id?: string;
    year: number;
    quarter: number;
    usuarioId: string;
    resultadoObjetivos: number;
    resultadoCompetencias: number;
    resultadoFinal: number;
    extra: string;
    createdAt?: Date;
    updatedAt?: Date;

    addRendimientoOperativo: (objetivoOperativoId: string) => Promise<void>;
}


export const Rendimiento = database.define<RendimientoModel>('rendimiento', {
    id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
    },
    year: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    quarter: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    usuarioId: {
        type: Sequelize.UUID,
        allowNull: false
    },
    resultadoObjetivos: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    resultadoCompetencias: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    resultadoFinal: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    extra: {
        type: Sequelize.TEXT,
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
        afterUpdate: (rendimiento: RendimientoModel, options) => {
         
        }  
    },
    defaultScope: {
        attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
    },
});

    