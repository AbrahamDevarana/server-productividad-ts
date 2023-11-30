import Sequelize from "sequelize";
import database from "../../config/database";


export const GaleriaDevarana = database.define('galeria_devarana', {
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
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: ''
    },
}, {
    paranoid: true,
});

