import Sequelize from "sequelize";
import database from "../../config/database";

export const PivotObjetivoRendimiento = database.define('pivot_objetivo_rendimiento', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,  
        autoIncrement: true,
    },
    objOperativoId: {
        type: Sequelize.UUID,
        allowNull: false,
    },
    rendimientoId: {
        type: Sequelize.UUID,
        allowNull: false,
    },
    year: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    quarter: {
        type: Sequelize.INTEGER,
        allowNull: false
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
    tableName: 'pivot_objetivo_rendimiento',
    indexes: [
        {
            unique: true,
            fields: ['objOperativoId', 'rendimientoId', 'year', 'quarter'],
            name: 'pivot_objetivo_rendimiento_unique'
        }
    ],
    charset: 'utf8mb4',
    collate: 'utf8mb4_bin',
});
