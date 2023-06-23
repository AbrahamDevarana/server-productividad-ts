import Sequelize, { Model }  from "sequelize";
import database from "../config/database";

export interface PermisosAttributes {
    id?: number;
    nombre: string;
    permisos: string;
}

export interface PermisosInstance extends Model<PermisosAttributes>, PermisosAttributes {}

export const Permisos = database.define<PermisosInstance>('permisos', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    permisos: {
        type: Sequelize.STRING,
    }
},  {
    timestamps: false,
    defaultScope: {
        attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
    },
})
