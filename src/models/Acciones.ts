import Sequelize, { Model } from "sequelize";
import database from "../config/database";
import { ResultadosClave } from "./ResultadoClave";


export interface AccionAttributes {
    id?: string;
    nombre: string;
    descripcion?: string;
    status?: number;
    resultadoClaveId: string;
    propietarioId: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface AccionInstance extends Model<AccionAttributes>, AccionAttributes {}


export const Acciones = database.define<AccionInstance>('acciones', {
    id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
    },
    nombre: {
        type: Sequelize.STRING,
        allowNull: false
    },
    descripcion: {
        type: Sequelize.STRING,
    },
    status: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    resultadoClaveId: {
        type: Sequelize.UUID,
        allowNull: false
    },
    propietarioId: {
        type: Sequelize.UUID,
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
    paranoid: true,
    timestamps: true,
    hooks: {
        afterUpdate: async (accion: AccionInstance, options) => {
           
            await updateProgreso(accion);
        },
        afterDestroy: async (accion: AccionInstance, options) => {
            await updateProgreso(accion);
        },
        afterCreate: async (accion: AccionInstance, options) => {
            await updateProgreso(accion);
        }



    },
    defaultScope: {
        attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
    },
});



const updateProgreso = async (accion: AccionInstance) => {
    
        const resultadoClave = await ResultadosClave.findOne({
            where: {
                id: accion.resultadoClaveId
            }
        });
        
        const acciones = await Acciones.findAll({
            where: {
                resultadoClaveId: accion.resultadoClaveId
            }
        });


        if(resultadoClave){
            if(resultadoClave.tipoProgreso === 'acciones'){
               
                let accionesCompletadas = 0;
                let accionesTotales = 0;

                acciones.forEach(accion => {
                    if(accion.status === 1){
                        accionesCompletadas++;
                    }
                    accionesTotales++;
                })

                const progresoTotal = accionesCompletadas/accionesTotales * 100

                await resultadoClave.update({ progreso: progresoTotal });

            }     
        }
    }