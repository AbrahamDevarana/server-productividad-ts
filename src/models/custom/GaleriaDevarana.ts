import Sequelize from "sequelize";
import database from "../../config/database";


const GaleriaUsuarios = database.define('galeria_usuarios', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    type: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'banner' //  banner, avatar
    },
    url: {
        type: Sequelize.STRING,
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
