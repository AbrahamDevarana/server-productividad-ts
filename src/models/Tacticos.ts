import Sequelize from "sequelize";
import database from "../config/database";
import Trimestre from "./custom/Trimestre";
import { Areas } from "./Areas";

export const Tacticos = database.define('obj_tacticos', {
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
    estrategicoId: {
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
    paranoid: true,
    timestamps: true,
    hooks: {
        beforeUpdate: async (tactico: any) => {
            tactico.updatedAt = new Date();
        },
        afterCreate: async (tactico: any) => {
            
            //  al crear hacer realción con los Cuatrimestres
            const year = tactico.fechaInicio.getFullYear();

            let trimestresParaAsignar = await Trimestre.findAll({
                where: {
                  [Sequelize.Op.or]: [
                    { year, trimestre: 4 },
                    { year, trimestre: 1 },
                    { year, trimestre: 2 },
                    { year, trimestre: 3 }
                  ]
                }
              });
            await tactico.setTrimestres(trimestresParaAsignar);

            if( tactico.estrategicoId ){
                const objetivoEstrategico = await tactico.getEstrategico()
                // Contar cuantos objetivos operativos tiene el objetivo estrategico
                const objetivosOperativos = await objetivoEstrategico.getTacticos();
                const totalObjetivosOperativos = objetivosOperativos.length + 1;
                tactico.codigo = `${objetivoEstrategico.codigo}-OT-${totalObjetivosOperativos}`;
                await tactico.save();                
            }else{
                const totalObjetivosOperativos = await Tacticos.count({
                    where: {
                        estrategicoId: null
                    },
                    include: [{
                        model: Areas,
                        as: 'areas',
                        where: {
                            codigo: tactico.codigo
                        }
                    }]
                })
                
                let code = `${tactico.codigo}-OT-${totalObjetivosOperativos + 1}`;
                tactico.codigo = code;
                await tactico.save();
            }
        },
    },
    defaultScope: {
        attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
    },
});
