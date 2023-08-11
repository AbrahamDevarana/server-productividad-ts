import Sequelize, { InferAttributes, InferCreationAttributes, Model } from "sequelize";
import database from "../config/database";


interface EvaluacionProps extends Model<InferAttributes<EvaluacionProps>, InferCreationAttributes<EvaluacionProps>> {

    id?: number;
    nombre: string;
    descripcion: string;
    status: boolean;
    createdAt?: Date;
    updatedAt?: Date;

}


export const Evaluacion = database.define<EvaluacionProps>('evaluacion', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nombre: {
        type: Sequelize.STRING(50),
        allowNull: false,
    },
    descripcion: {
        type: Sequelize.STRING(100),
    },
    status: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
    },
    createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
    },
    updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
    }
}, {
    timestamps: true,
    paranoid: true,
    tableName: 'evaluaciones',
    hooks: {
        afterFind: (evaluacion) => {
            // @ts-ignore
            console.log('Evaluacion encontrada', evaluacion.__proto__);
        }
            
    },
    defaultScope:{
        attributes: {exclude: ['createdAt', 'updatedAt', 'deletedAt']}
    }
});


    