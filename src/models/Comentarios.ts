import Sequelize from "sequelize";
import database from "../config/database";

export const Comentarios = database.define('comentarios', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    comentableId: {
        type: Sequelize.UUID,
    },
    comentableType: {
        type: Sequelize.TEXT,
    },
    autorId: {
        type: Sequelize.UUID,
    },
    mensaje: {
        type: Sequelize.TEXT,
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
    timestamps: true,
});

