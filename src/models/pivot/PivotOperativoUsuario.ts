import Sequelize from "sequelize";
import database from "../../config/database";

export const PivotOpUsuario = database.define('pivot_operativo_usuario', {
    responsableId: {
        type: Sequelize.UUID,
        allowNull: false,
    },
    objetivoOperativoId: {
        type: Sequelize.UUID,
        allowNull: false,
    },
    propietario: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    progresoFinal: {
        type: Sequelize.FLOAT,
        allowNull: true,   
        defaultValue: 0
    },
    progresoAsignado: {
        type: Sequelize.FLOAT,
        allowNull: true,
        defaultValue: 0
    },
    progresoReal: {
        type: Sequelize.FLOAT,
        allowNull: true,
        defaultValue: 0
    },
    extra: {
        type: Sequelize.FLOAT,
        allowNull: true,
        defaultValue: 0
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