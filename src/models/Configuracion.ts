import Sequelize from "sequelize";
import database from "../config/database";

export const Configuracion = database.define('configuracion', {

}, {
    paranoid: true,
    timestamps: true,
    hooks: {     
    },
    
});