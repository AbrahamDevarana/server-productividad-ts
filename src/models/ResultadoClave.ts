import Sequelize, { Model }  from "sequelize";
import database from "../config/database";

export interface ResultadoClaveAttributes {
    id?: string;
    nombre: string;
    progreso?: number;
    tipoProgreso?: string;
    fechaInicio?: Date;
    fechaFin?: Date;
    operativoId: string;
    propietarioId: string;
    status?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ResultadoClaveInstance extends Model<ResultadoClaveAttributes>, ResultadoClaveAttributes {}

export const ResultadosClave = database.define<ResultadoClaveInstance>('resultado_clave', {
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
        afterUpdate: (resultadoClave: ResultadoClaveInstance, options) => {
            
        }
    },
    defaultScope: {
        attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
    },
})
