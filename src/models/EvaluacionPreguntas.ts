import Sequelize, { InferAttributes, InferCreationAttributes, Model } from "sequelize";
import database from "../config/database";


interface EvaluacionPreguntasProps extends Model<InferAttributes<EvaluacionPreguntasProps>, InferCreationAttributes<EvaluacionPreguntasProps>> {

    id?: number;
    pregunta: string;
    descripcion: string;
    informacionAdicional: string;
    createdAt?: Date;
    updatedAt?: Date;

}

export const EvaluacionPreguntas = database.define<EvaluacionPreguntasProps>('evaluacion_preguntas', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    pregunta: {
        type: Sequelize.STRING,
        allowNull: false
    },
    descripcion: {
        type: Sequelize.TEXT,
    },
    informacionAdicional: {
        type: Sequelize.TEXT,
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
    tableName: 'evaluacion_preguntas',
    timestamps: true,
    paranoid: true,
    hooks: {
        afterFind: (evaluacionPreguntas) => {
            // @ts-ignore
            console.log('EvaluacionPreguntas', evaluacionPreguntas.__proto__);
            
            
        }
    },
    defaultScope:{
        attributes: {exclude: ['createdAt', 'updatedAt', 'deletedAt']}
    }
})

