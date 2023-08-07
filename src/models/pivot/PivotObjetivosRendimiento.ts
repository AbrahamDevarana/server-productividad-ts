import Sequelize, { InferAttributes, InferCreationAttributes, Model } from "sequelize";
import database from "../../config/database";





export interface ObjetivosRendimientoModel extends Model<InferAttributes<ObjetivosRendimientoModel>, InferCreationAttributes<ObjetivosRendimientoModel>> {
    id?: number;
    objetivoOperativoId: string;
    rendimientoId: string;
    progresoAsignado: number;
    progresoReal: number;
    createdAt?: Date;
    updatedAt?: Date;
}


export const PivotObjetivosRendimiento = database.define<ObjetivosRendimientoModel>('pivot_objetivos_rendimiento', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    objetivoOperativoId: {
        type: Sequelize.UUID,
        allowNull: false
    },
    rendimientoId: {
        type: Sequelize.UUID,
        allowNull: false
    },
    progresoAsignado: {
        type: Sequelize.FLOAT,
        allowNull: false,
    },
    progresoReal: {
        type: Sequelize.FLOAT,
        allowNull: false,
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
    paranoid: true,
    hooks: {
        beforeUpdate: async (objetivosRendimiento: any) => {
        }
    }
});


    