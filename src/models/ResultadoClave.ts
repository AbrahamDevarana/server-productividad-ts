import Sequelize, { InferAttributes, InferCreationAttributes, Model }  from "sequelize";
import database from "../config/database";
import { OperativoModel } from "./history/OperativoHistory";


export interface ResultadoClaveModel extends Model<InferAttributes<ResultadoClaveModel>, InferCreationAttributes<ResultadoClaveModel>> {
    id?: string;
    nombre: string;
    progreso: number;
    tipoProgreso: 'porcentaje' | 'acciones';
    fechaInicio: Date;
    fechaFin: Date;
    operativoId: string;
    propietarioId: string;
    status: string;
    createdAt?: Date;
    updatedAt?: Date;


    getOperativo: () => any;
    setOperativo: (operativo: OperativoModel) => void;
    createOperativo: (operativo: OperativoModel) => void;
    getPropietario: () => any;
    setPropietario: (propietario: any) => void;
    createPropietario: (propietario: any) => void;
    getTask:  () => any;
    countTask:  () => any;
    hasTask:  () => any;
    setTask: (task: any) => void;
    addTask: (task: any) => void;
    removeTask: (task: any) => void;
    createTask: (task: any) => void;
}

export const ResultadosClave = database.define<ResultadoClaveModel>('resultado_clave', {
    id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
    },
    nombre: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'Nuevo Resultado Clave'
    },
    progreso: {
        type: Sequelize.FLOAT,
        allowNull: true,
        defaultValue: 0
    },
    tipoProgreso:{
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 'porcentaje'
    },
    fechaInicio: {
        type: Sequelize.DATE,
    },
    fechaFin: {
        type: Sequelize.DATE,
    },
    operativoId: {
        type: Sequelize.UUID,
        allowNull: false
    },
    propietarioId: {
        type: Sequelize.UUID,
        allowNull: false
    },
    status: {
        type: Sequelize.STRING(12),
        allowNull: false,
        defaultValue: 'SIN_INICIAR'
    },   
},{
    paranoid: true,
    timestamps: true,
    hooks: {
    },
    defaultScope: {
        attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
    },
})