import Sequelize, { InferAttributes, InferCreationAttributes, Model } from "sequelize";
import database from "../../config/database";



export interface EvaluacionModelProps extends Model<InferAttributes<EvaluacionModelProps>, InferCreationAttributes<EvaluacionModelProps>> {
    id?: number;
    nombre?: string;
    descripcion?: string;
    createdAt?: Date;
    updatedAt?: Date;

    setPreguntasEvaluacion: (args: unknown[]) => void;
    getPreguntasEvaluacion: () => void
    countPreguntasEvaluacion: () => void
    hasPreguntasEvaluacion: () => void
    addPreguntasEvaluacion: () => void
    removePreguntasEvaluacion: () => void
    createPreguntasEvaluacion: () => void
    getUsuariosEvaluados: () => void
    countUsuariosEvaluados: () => void
    hasUsuariosEvaluado: () => void
    hasUsuariosEvaluados: () => void
    setUsuariosEvaluados: (args: unknown[]) => void
    addUsuariosEvaluado: () => void
    addUsuariosEvaluados: () => void
    removeUsuariosEvaluado: () => void
    removeUsuariosEvaluados: () => void
    createUsuariosEvaluado: () => void
}

export const Evaluacion = database.define<EvaluacionModelProps>(
    "evaluacion",
    {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        nombre: {
            type: Sequelize.STRING,
        },
        descripcion: {
            type: Sequelize.STRING,
        },
        createdAt: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW,
        },
        updatedAt: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW,
        },

    },
    {
        tableName: "evaluacion",
        paranoid: true,
        timestamps: true,
        hooks: {
            // afterFind: (evaluacion: any) => {
            //     console.log(evaluacion.__proto__);
                
            // }
        },
        defaultScope: {
            attributes: { exclude: ["createdAt", "updatedAt, deletedAt"] },
        },
    },
);
