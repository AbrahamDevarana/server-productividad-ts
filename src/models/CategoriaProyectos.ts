import Sequelize, { InferAttributes, InferCreationAttributes, Model } from "sequelize";
import database from "../config/database";

export interface CategoriaProyectosModel extends Model<InferAttributes<CategoriaProyectosModel>, InferCreationAttributes<CategoriaProyectosModel>> {

    id?: number;
    nombre: string;
    descripcion: string;
    propietarioId: string;
    createdAt?: Date;
    updatedAt?: Date;
}


export const CategoriaProyectos = database.define<CategoriaProyectosModel>('categoria_proyectos', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    descripcion: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    propietarioId: {
        type: Sequelize.UUID,
        allowNull: false
    },
    createdAt: {
        type: Sequelize.DATE,
        defaultValue: new Date()
    },
    updatedAt: {
        type: Sequelize.DATE,
        defaultValue: new Date()
    },
}, {
    timestamps: true,
});