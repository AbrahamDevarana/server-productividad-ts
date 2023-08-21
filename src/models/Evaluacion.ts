import Sequelize, { InferAttributes, InferCreationAttributes, Model } from "sequelize";
import database from "../config/database";


interface EvaluacionModelProps extends Model<InferAttributes<EvaluacionModelProps>, InferCreationAttributes<EvaluacionModelProps>> {
    id?: number;
    nombre: string;
    descripcion: string;
    status: boolean;
    tipoEvaluacionId: number;
    createdAt?: Date;
    updatedAt?: Date;


    getUsuariosEvaluados: () => Promise<any>
    countUsuariosEvaluados: () => Promise<any>
    hasUsuariosEvaluado: () => Promise<any>
    hasUsuariosEvaluados: () => Promise<any>
    setUsuariosEvaluados: () => Promise<any>
    addUsuariosEvaluado: () => Promise<any>
    addUsuariosEvaluados: () => Promise<any>
    removeUsuariosEvaluado: () => Promise<any>
    removeUsuariosEvaluados: () => Promise<any>
    createUsuariosEvaluado: () => Promise<any>
    getPreguntas: () => Promise<any>
    countPreguntas: () => Promise<any>
    hasPregunta: () => Promise<any>
    hasPreguntas: () => Promise<any>
    setPreguntas: (args: unknown[]) => Promise<any>
    addPregunta: (args: unknown) => Promise<any>
    addPreguntas: (args: unknown[]) => Promise<any>
    removePregunta: (args: unknown) => Promise<any>
    removePreguntas: (args: unknown[]) => Promise<any>
    createPregunta: () => Promise<any>
}


export const Evaluacion = database.define<EvaluacionModelProps>('evaluacion', {
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
    tipoEvaluacionId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 2,
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
        afterFind: async (evaluacion: EvaluacionModelProps) => {
            // @ts-ignore
            console.log('Evaluacion encontrada', evaluacion.__proto__);

        }
            
    },
    defaultScope:{
        attributes: {exclude: ['createdAt', 'updatedAt', 'deletedAt']}
    }
});


    