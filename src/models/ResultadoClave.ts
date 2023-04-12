import Sequelize  from "sequelize";
import database from "../config/database";

export const ResultadosClave = database.define('resultado_clave', {
    id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
    },
    nombre: {
        type: Sequelize.STRING,
        allowNull: false
    },
    progreso: {
        type: Sequelize.FLOAT,
        allowNull: true,
        defaultValue: 0
    },
    tipoProgreso:{
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 'porcentaje'
    },
    fechaInicio: {
        type: Sequelize.DATE,
        allowNull: true
    },
    fechaFin: {
        type: Sequelize.DATE,
        allowNull: true
    },
    operativoId: {
        type: Sequelize.UUID,
        allowNull: false
    },
    propietarioId: {
        type: Sequelize.UUID,
        allowNull: false
    },
    status: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
    },   
},{
    paranoid: true,
    timestamps: true,
    hooks: {
        afterUpdate: (resultadoClave, options) => {
            resultadoClave.update({
                updatedAt: Sequelize.NOW
            });
        }
    }
})