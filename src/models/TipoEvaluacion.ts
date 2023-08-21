import Sequelize, { InferAttributes, InferCreationAttributes, Model } from "sequelize";
import database from "../config/database";


interface TipoEvaluacionProps extends Model<InferAttributes<TipoEvaluacionProps>, InferCreationAttributes<TipoEvaluacionProps>> {
    id?: number;
    nombre: string;
    createdAt?: Date;
    updatedAt?: Date;

}


export const TipoEvaluacion = database.define<TipoEvaluacionProps>('tipo_evaluacion', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },

    nombre: {
        type: Sequelize.STRING(50),
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
    tableName: 'tipo_evaluacion',
    timestamps: true,
    paranoid: true,
    defaultScope:{
        attributes: {exclude: ['createdAt', 'updatedAt', 'deletedAt']}
    },
   
})
