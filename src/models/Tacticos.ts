import Sequelize from "sequelize";
import database from "../config/database";

export const Tacticos = database.define('obj_tacticos', {
    id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
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
    indicador: {
        type: Sequelize.TEXT,
        allowNull: true
    },
    progreso: { // avance
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    fechaInicio: {
        type: Sequelize.DATE,
        allowNull: false
    },
    fechaFin: {
        type: Sequelize.DATE,
        allowNull: false
    },
    propietarioId: {
        type: Sequelize.UUID,
        allowNull: true
    },
    estrategicoId: {
        type: Sequelize.UUID,
        allowNull: true
    },
    tipoProgreso: {
        type: Sequelize.INTEGER,
        defaultValue: 1
    },

    trimestres: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    objetivoPadre: { // Objetivo Táctico Dividido por Trimestres 
        type: Sequelize.UUID,
        allowNull: true,  
    },
    status: {
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
    }
},{
    paranoid: true,
    timestamps: true,
    hooks: {
        beforeUpdate: async (tactico: any) => {
            tactico.updatedAt = new Date();
        },
        afterCreate: async (tactico: any) => {

        },
        afterUpdate: async (tactico: any) => {
            const estrategico = await tactico.getObjetivoEstrategico();

            if(tactico.codigo === null || tactico.codigo === undefined || tactico.codigo === ''){
                if(estrategico){
                    const codigoEstrategico = estrategico.codigo;
                    const numObjetivos = await estrategico.countTacticos();
                    const codigoTactico = `${codigoEstrategico}-OT${numObjetivos}`;
                    tactico.codigo = codigoTactico;
                }else{
                    const numObjetivos = await Tacticos.count({ where: { ObjetivoEstrategicoId: null }});
                    const codigoTactico = `C-${numObjetivos + 1}`;
                    tactico.codigo = codigoTactico;
                }
            }
          
            await tactico.save();
        }
    },
    defaultScope: {
        attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
    },
});
