import Sequelize from "sequelize";
import database from "../config/database";

export const Core = database.define('obj_core', {
    id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
    },
    nombre: {
        type: Sequelize.STRING,
    },
    codigo: {
        type: Sequelize.STRING,
    },
    meta: {
        type: Sequelize.TEXT,
    },
    indicador: {
        type: Sequelize.TEXT,
    },
    progreso: { // avance
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    fechaInicio: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
    fechaFin: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
    propietarioId: {
        type: Sequelize.UUID,
    },
    tipoProgreso: {
        type: Sequelize.INTEGER, // 1 = manual | 2 = % objetivos operativos
        defaultValue: 1
    },
    status: {
        type: Sequelize.STRING(12),
        allowNull: false,
        defaultValue: 'SIN_INICIAR'
    },
    createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
    updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    }
},{
    tableName: 'obj_core',
    paranoid: true,
    timestamps: true,
    hooks: {
        beforeUpdate: async (tactico: any) => {
            tactico.updatedAt = new Date();
        },
        afterCreate: async (tactico: any) => {
   
        },
    },
    defaultScope: {
        attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
    },
});
