import Sequelize from "sequelize";
import database from "../config/database";

export const Comentarios = database.define('comentarios', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    comentableId: { // id del objetivo, iniciativa o acción
        type: Sequelize.UUID,
    },
    comentableType: { // 'objetivo_estrategico' | 'iniciativa_estrategica' | 'accion'
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

