import Sequelize, { InferAttributes, InferCreationAttributes, Model } from "sequelize";
import database from "../config/database";


interface EvaluacionRespuestaModel extends Model<InferAttributes<EvaluacionRespuestaModel>, InferCreationAttributes<EvaluacionRespuestaModel>> {

    id?: number;
    texto: string;
    calificacion: number;
    createdAt?: Date;
    updatedAt?: Date;

}

export const EvaluacionRespuesta = database.define<EvaluacionRespuestaModel>('evaluacion_preguntas', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    texto: {
        type: Sequelize.STRING,
        allowNull: false
    },
    calificacion: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
    updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    }
}, {
    tableName: 'evaluacion_respuesta',
    timestamps: true,
    paranoid: true,
    defaultScope:{
        attributes: {exclude: ['createdAt', 'updatedAt', 'deletedAt']}
    }
})