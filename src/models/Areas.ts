import Sequelize, { Model, HasManyGetAssociationsMixin, HasManyCountAssociationsMixin, HasManyHasAssociationMixin, HasManyHasAssociationsMixin, HasManySetAssociationsMixin, HasManyAddAssociationMixin, HasManyAddAssociationsMixin, HasManyRemoveAssociationMixin, HasManyRemoveAssociationsMixin, HasOneGetAssociationMixin, HasOneSetAssociationMixin, HasOneCreateAssociationMixin, BelongsToSetAssociationMixin, BelongsToCreateAssociationMixin, HasManyCreateAssociationMixin, BelongsToGetAssociationMixin } from "sequelize";
import database from "../config/database";
import slugify from "slugify";
import { AreaInterface } from "../interfaces";
import { PerspectivaInstance } from "./Perspectivas";
import { DepartamentosInterface } from "./Departamentos";
import { UsuarioInstance } from "./Usuarios";


export interface AreaInstance extends Model<AreaInterface>, AreaInterface {
    // Métodos generados automáticamente para asociaciones con subAreas
    getSubAreas: HasManyGetAssociationsMixin<AreaInstance>;
    countSubAreas: HasManyCountAssociationsMixin;
  
//     // Métodos generados automáticamente para asociaciones con departamentos
    getDepartamentos: HasManyGetAssociationsMixin<DepartamentosInterface>;
    countDepartamentos: HasManyCountAssociationsMixin;
  
//     // Métodos generados automáticamente para la relación one-to-one con Perspectivas
    getPerspectivas: HasOneGetAssociationMixin<PerspectivaInstance>;
    setPerspectivas: HasOneSetAssociationMixin<PerspectivaInstance, number>;
    createPerspectivas: HasOneCreateAssociationMixin<PerspectivaInstance>;
  
//     // Métodos generados automáticamente para la relación belongs-to con Usuarios (leader)
    getLeader: BelongsToGetAssociationMixin<UsuarioInstance>;
    setLeader: BelongsToSetAssociationMixin<UsuarioInstance, number>;
  }


export const Areas = database.define<AreaInstance>('areas', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: Sequelize.STRING,
        allowNull: false
    },
    parentId: {
        type: Sequelize.INTEGER,
    },
    leaderId: {
        type: Sequelize.UUID,
    },
    slug:{
        type: Sequelize.STRING,
    },
    codigo: {
        type: Sequelize.STRING,
    },
    order: {
        type: Sequelize.INTEGER,
    },
    status: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
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
        afterFind: async (area: AreaInstance) => {
            // console.log('afterFind');

            // if(Array.isArray(area)){
            //     console.log(area[0].__proto__);
            // }
            // // @ts-ignore
            // console.log(area.__proto__);
            
                
            
        },
        beforeUpdate: async (area: any) => {
            area.updatedAt = new Date();
            area.slug = slugify(area.nombre, { lower: true });
        },
        beforeCreate: async (area: any) => {
            area.slug = slugify(area.nombre, { lower: true });
        }
    },
    defaultScope: {
        attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
    },
});

