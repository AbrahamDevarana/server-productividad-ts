import Sequelize from "sequelize";
import database from "../config/database";
import { v4 as uuidv4 } from 'uuid';

export const Tacticos = database.define('tacticos', {
    id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: () => uuidv4()
    },
    nombre: {
        type: Sequelize.STRING,
        allowNull: false
    },
    codigo: {
        type: Sequelize.STRING,
        allowNull: true
    },
    meta: {
        type: Sequelize.TEXT,
        allowNull: true
    },
    descripcion: { // Indicador del objetivo
        type: Sequelize.TEXT,
        allowNull: true
    },
    progreso: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    status: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    fechaInicio: {
        type: Sequelize.DATE,
        allowNull: true
    },
    fechaFin: {
        type: Sequelize.DATE,
        allowNull: true
    },
    tipoObjetivo: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
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
        beforeUpdate: async (tactico: any) => {
            tactico.updatedAt = new Date();
        },
        afterCreate(tactico: any) {
            // console.log('Tactico creado');
            // comprobar si tiene relacion con un obj_estrategico y si ese obj_estrategico tiene relacion con una perspectiva, si la tiene generar un codigo usando
            // el codigo de la perspectiva y el codigo del obj_estrategico + el # consecutivo
            tactico.getObjetivoEstrategico().then((obj_estrategico: any) => {
                obj_estrategico.getPerspectiva().then((perspectiva: any) => {
                    if (perspectiva) {
                        console.log('perspectiva: ', perspectiva);
                        console.log('obj_estrategico: ', obj_estrategico);
                        // generar codigo
                        Tacticos.findAll({
                            where: {
                                objetivoEstrategicoId: obj_estrategico.id
                            }
                        }).then((tacticos: any) => {
                            console.log('tacticos: ', tacticos);
                            let consecutivo = tacticos.length;
                            let codigo = perspectiva.codigo + obj_estrategico.codigo + consecutivo;
                            console.log('codigo: ', codigo);
                            tactico.update({
                                codigo: codigo
                            });
                        });
                    }
                });
            });
        },
    },
    defaultScope: {
        attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
    },
});




    


