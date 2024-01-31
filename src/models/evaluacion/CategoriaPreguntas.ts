import Sequelize, { InferAttributes, InferCreationAttributes, Model } from "sequelize";
import database from "../../config/database";


interface CategoriaPreguntasModel extends Model<InferAttributes<CategoriaPreguntasModel>, InferCreationAttributes<CategoriaPreguntasModel>> {
    id?: number;
    nombre: string;
    preguntas?: [];
    createdAt?: Date;
    updatedAt?: Date;
}

export const CategoriaPreguntas = database.define<CategoriaPreguntasModel>('categoria_preguntas', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },

    nombre: {
        type: Sequelize.STRING(50),
        allowNull: false,
    },
    createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
    },
    updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
    },
}, {
    tableName: 'categoria_preguntas',
    timestamps: true,
    paranoid: true,
    defaultScope:{
        attributes: {exclude: ['createdAt', 'updatedAt', 'deletedAt']}
    },
   
})