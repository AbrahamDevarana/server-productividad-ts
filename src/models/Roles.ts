import Sequelize, { InferAttributes, InferCreationAttributes, Model }  from "sequelize";
import database from "../config/database";
import { PermisosModel } from "./Permisos";


export interface RoleModel extends Model<InferAttributes<RoleModel>, InferCreationAttributes<RoleModel>> {

    id?: number;
    nombre: string;
    descripcion?: string;
    status?: string;
    permisos?: PermisosModel[];
    getPermisos: () => Promise<any>;
    countPermisos: () => Promise<any>
    hasPermiso: () => Promise<any>
    hasPermisos: () => Promise<any>
    setPermisos:  ( args: unknown[] ) => Promise<any>
    addPermiso: () => Promise<any>
    addPermisos: () => Promise<any>
    removePermiso: () => Promise<any>
    removePermisos: () => Promise<any>
    createPermiso: () => Promise<any>
}

export const Roles = database.define<RoleModel>('roles', {
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
