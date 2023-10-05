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
    status: string;
    createdAt?: Date;
    updatedAt?: Date;


    
    getRendimientoOperativo: () => Promise<any>
    countRendimientoOperativo: () => Promise<any>
    hasRendimientoOperativo: () => Promise<any>
    setRendimientoOperativo: () => Promise<any>
    addRendimientoOperativo: () => Promise<any>
    removeRendimientoOperativo: () => Promise<any>
    createRendimientoOperativo: () => Promise<any>
    
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
    status: {
        type: Sequelize.ENUM('ABIERTO', 'CERRADO'),
        defaultValue: 'ABIERTO'

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

    