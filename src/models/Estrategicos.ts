import Sequelize from "sequelize";
import database from "../config/database";
import { v4 as uuidv4 } from 'uuid';

export const ObjetivoEstrategico = database.define('obj_estrategico', {
    id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: () => uuidv4()
    },
    nombre: {
        type: Sequelize.STRING,
        defaultValue: 'Nuevo Objetivo Estratégico'
    },
    codigo: {
        type: Sequelize.STRING,
    },
    descripcion: {
        type: Sequelize.TEXT,
    },
    indicador: {
        type: Sequelize.TEXT,
    },
    progreso: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    propietarioId: {
        type: Sequelize.UUID,
        allowNull: false
    },
    year: {
        type: Sequelize.INTEGER,
        defaultValue: new Date().getFullYear(),
    },
    perspectivaId: {
        type: Sequelize.UUID,
        allowNull: false
    },
    tipoProgreso: {
        type: Sequelize.ENUM('PROMEDIO', 'MANUAL'), // 1 = manual | 2 = % objetivos operativos
        defaultValue: 'PROMEDIO'
    },
    status: {
        type: Sequelize.STRING(12),
        defaultValue: 'SIN_INICIAR'
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
    paranoid: true,
    timestamps: true,
    hooks: {
        beforeUpdate: async (objetivoEstrategico: any) => {
            objetivoEstrategico.updatedAt = new Date();
        },
        afterCreate: async (objetivoEstrategico: any) => {
            const perspectiva = await objetivoEstrategico.getPerspectivas();
            // contar las estrategias de la perspectiva
            const estrategias = await perspectiva.getObjetivosEstrategicos({
                where: { year: objetivoEstrategico.year }
            });

            const estrategiasCount = estrategias.length;
            objetivoEstrategico.codigo = `${perspectiva.codigo}${estrategiasCount}`;
            await objetivoEstrategico.save();
        }
    },
    defaultScope: {
        attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
    },
});





