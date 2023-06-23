import Sequelize, { Model }  from "sequelize";
import database from "../config/database";

export interface RolesAttributes {
    id?: number;
    nombre: string;
    descripcion?: string;
    status?: string;

}

export interface RolesInstance extends Model<RolesAttributes>, RolesAttributes {}

export const Roles = database.define<RolesInstance>('roles', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    descripcion: {
        type: Sequelize.STRING,
    },
    status: {
        type: Sequelize.INTEGER,
        defaultValue: 1
    },
},  {
    timestamps: false,
    paranoid: true,
    defaultScope: {
        attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
    },
})
