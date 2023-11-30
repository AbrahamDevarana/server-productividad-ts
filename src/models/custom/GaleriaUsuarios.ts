import Sequelize, { InferAttributes, InferCreationAttributes, Model } from "sequelize";
import database from "../../config/database";


export interface GaleriaModel extends Model<InferAttributes<GaleriaModel>, InferCreationAttributes<GaleriaModel>> {


    id?: number;
    usuarioId: string;
    type: 'BANNER_PERFIL' | 'AVATAR'
    url: string;
    favorito?: boolean;
}


const GaleriaUsuarios = database.define<GaleriaModel>('galeria_usuarios', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    usuarioId: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false
    },
    type: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'BANNER_PERFIL' //  banner, avatar
    },
    url: {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: ''
    },
    favorito: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
}, {
    paranoid: true,
});

export default GaleriaUsuarios;
