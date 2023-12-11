import Sequelize, { InferAttributes, InferCreationAttributes, Model } from "sequelize";
import database from "../config/database";
import dayjs from "dayjs";

export interface GestionObjetivosModel extends Model<InferAttributes<GestionObjetivosModel>, InferCreationAttributes<GestionObjetivosModel>> {
    
    id?: number;
    year: number;
    quarter: number;
    periodoDefinicionInicio?: Date;
    periodoDefinicionFin?: Date;
    ejecucionInicio?: Date;
    ejecucionFin?: Date;
    revisionIntermediaInicio?: Date;
    revisionIntermediaFin?: Date;
    cierreObjetivosInicio?: Date;
    cierreObjetivosFin?: Date;
    cierreEvaluacionCompetenciasInicio?: Date;
    cierreEvaluacionCompetenciasFin?: Date;
}


export const GestionObjetivos = database.define<GestionObjetivosModel>('gestion_objetivos', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    year: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    quarter: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    periodoDefinicionInicio: {
        type: Sequelize.DATE,
        defaultValue: new Date()
    },
    periodoDefinicionFin: {
        type: Sequelize.DATE,
        defaultValue: new Date()
    },
    ejecucionInicio: {
        type: Sequelize.DATE,
        defaultValue: new Date()
    },
    ejecucionFin: {
        type: Sequelize.DATE,
        defaultValue: new Date()
    },
    revisionIntermediaInicio: {
        type: Sequelize.DATE,
        defaultValue: new Date()
    },
    revisionIntermediaFin: {
        type: Sequelize.DATE,
        defaultValue: new Date()
    },
    cierreObjetivosInicio: {
        type: Sequelize.DATE,
        defaultValue: new Date()
    },
    cierreObjetivosFin: {
        type: Sequelize.DATE,
        defaultValue: new Date()
    },
    cierreEvaluacionCompetenciasInicio: {
        type: Sequelize.DATE,
        defaultValue: new Date()
    },
    cierreEvaluacionCompetenciasFin: {
        type: Sequelize.DATE,
        defaultValue: new Date()
    },
}, {
    timestamps: true,
    hooks: {
    },
    paranoid: true
});
