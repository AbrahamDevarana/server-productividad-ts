import Sequelize, { InferAttributes, InferCreationAttributes, Model }  from "sequelize";
import database from "../config/database";


export interface PermisosModel extends Model<InferAttributes<PermisosModel>, InferCreationAttributes<PermisosModel>> {
    id?: number;
    nombre: string;
    permisos: string;
}

export const Permisos = database.define<PermisosModel>('permisos', {
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
