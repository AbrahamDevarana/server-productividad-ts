import Sequelize, { InferAttributes, InferCreationAttributes, Model } from "sequelize";
import database from "../config/database";
import slugify from "slugify";


export interface DepartamentosModel extends Model<InferAttributes<DepartamentosModel>, InferCreationAttributes<DepartamentosModel>> {

    id?: number;
    nombre: string;
    areaId: number;
    leaderId: string;
    status?: boolean;
    color: string;
    slug?: string;
    order?: number;
    createdAt?: Date;
    updatedAt?: Date;
    leader?: any
    area?: any


    getArea: () => any,
    setArea: () => any,
    createArea: () => any,
    getUsuario: () => any,
    countUsuario: () => any,
    hasUsuario: () => any,
    setUsuario: () => any,
    addUsuario: () => any,
    removeUsuario: () => any,
    createUsuario: () => any,
    getLeader: () => any,
    setLeader: () => any,
    createLeader: () => any,
    getTacticos: () => any,
    countTacticos: () => any,
    hasTactico: () => any,
    hasTacticos: () => any,
    setTacticos: () => any,
    addTactico: () => any,
    addTacticos: () => any,
    removeTactico: () => any,
    removeTacticos: () => any,
    createTactico: () => any,
    getCore: () => any,
    countCore: () => any,
    hasCore: () => any,
    setCore: () => any,
    addCore: () => any,
    removeCore: () => any,
    createCore: () => any,
    
}

export const Departamentos = database.define<DepartamentosModel>('departamentos', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: Sequelize.STRING,
        allowNull: false
    },
    areaId: {
        type: Sequelize.INTEGER,
    },
    leaderId: {
        type: Sequelize.UUID,
        allowNull: true
    },
    status: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: 1
    },
    color: {
        type: Sequelize.STRING,
        allowNull: true
    },
    slug:{
        type: Sequelize.STRING,
    },
    order: {
        type: Sequelize.INTEGER,
        defaultValue: 2
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
        beforeUpdate: async (departamento: any) => {
            departamento.updatedAt = new Date();
            departamento.slug = slugify(departamento.nombre, { lower: true });
        },
        beforeCreate: async (departamento: any) => {
            departamento.slug = slugify(departamento.nombre, { lower: true });
        },
    },
    defaultScope: {
        attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
    },
});


