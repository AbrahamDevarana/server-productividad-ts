import Sequelize, { InferAttributes, InferCreationAttributes, Model } from "sequelize";
import database from "../config/database";
import { v4 as uuidv4 } from 'uuid';


export interface ObjetivosOperativosModel extends Model<InferAttributes<ObjetivosOperativosModel>, InferCreationAttributes<ObjetivosOperativosModel>> {

    id?: string;
    nombre: string;
    meta?: string;
    indicador?: string;
    tacticoId?: string;
    fechaInicio: Date;
    fechaFin: Date;
    quarter: number;
    year: number;
    editado?: boolean;
    status?: 'NUEVO' | 'POR_AUTORIZAR' | 'ABIERTO' | 'POR_APROBAR' | 'CERRADO';
    createdAt?: Date;
    updatedAt?: Date;

    // __associations__
    getTactico_operativo: () => Promise<any>
    setTactico_operativo: () => Promise<any>
    createTactico_operativo: () => Promise<any>
    getResultadosClave: () => Promise<any>
    countResultadosClave: () => Promise<any>
    hasResultadosClave: () => Promise<any>
    setResultadosClave: () => Promise<any>
    addResultadosClave: () => Promise<any>
    removeResultadosClave: () => Promise<any>
    createResultadosClave: () => Promise<any>

    getOperativoRendimiento: () => Promise<any>
    countOperativoRendimiento: () => Promise<any>
    hasOperativoRendimiento: () => Promise<any>
    setOperativoRendimiento: () => Promise<any>
    addOperativoRendimiento: () => Promise<any>
    removeOperativoRendimiento: () => Promise<any>
    createOperativoRendimiento: () => Promise<any>

    getOperativosResponsable: () => Promise<any>
    countOperativosResponsable: () => Promise<any>
    hasOperativosResponsable: () => Promise<any>
    setOperativosResponsable: (args: unknown[]) => Promise<any>
    addOperativosResponsable: () => Promise<any>
    removeOperativosResponsable: () => Promise<any>
    createOperativosResponsable: () => Promise<any>

    // __proto__



}


export const ObjetivoOperativos = database.define<ObjetivosOperativosModel>('obj_operativos', {
    id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: () => uuidv4()
    },
    nombre: {
        type: Sequelize.STRING,
        allowNull: false
    },
    meta: {
        type: Sequelize.TEXT,
        allowNull: true
    },
    indicador: {
        type: Sequelize.TEXT,
        allowNull: true
    },
    tacticoId: {
        type: Sequelize.UUID,
        allowNull: true,
    },
    fechaInicio: {
        type: Sequelize.DATE,
        allowNull: false
    },
    fechaFin: {
        type: Sequelize.DATE,
        allowNull: false
    },
    quarter: {
        type: Sequelize.SMALLINT,
        allowNull: true
    },
    year: {
        type: Sequelize.SMALLINT,
        allowNull: true
    },
    editado: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false
    },
    status: {
        type: Sequelize.CHAR(100),
        defaultValue: 'NUEVO'
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


