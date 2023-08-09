import Sequelize, { Association, BelongsTo, Model }  from "sequelize";
import database from "../config/database";
import { ObjetivoOperativos } from "./Operativos";
import { AccionInstance } from "./Acciones";
import dayjs from "dayjs";

export interface ResultadoClaveAttributes {
    id?: string;
    nombre: string;
    progreso: number;
    tipoProgreso: string;
    fechaInicio: Date;
    fechaFin: Date;
    operativoId: string;
    propietarioId: string;
    status: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ResultadoClaveInstance extends Model<ResultadoClaveAttributes>, ResultadoClaveAttributes {
    
}

export const ResultadosClave = database.define<ResultadoClaveInstance>('resultado_clave', {
    id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
    },
    nombre: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'Nuevo Resultado Clave'
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
    },
    fechaFin: {
        type: Sequelize.DATE,
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
        type: Sequelize.STRING(12),
        allowNull: false,
        defaultValue: 'SIN_INICIAR'
    },   
},{
    paranoid: true,
    timestamps: true,
    hooks: {
        afterUpdate: async (resultadoClave: ResultadoClaveInstance, options) => {
            //    await updateDate(resultadoClave)
        },

    },
    defaultScope: {
        attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
    },
})


// const updateDate = async (resultadoClave: ResultadoClaveInstance) => {

//     // Obtener el operativo
//     const operativo = await ObjetivoOperativos.findOne({
//         where: {
//             id: resultadoClave.operativoId
//         }
//     });

//     // Obtener todos los resultados clave del operativo
//     const resultadosClave = await ResultadosClave.findAll({
//         where: {
//             operativoId: operativo!.id
//         }
//     });



//     if(operativo){
//         if(resultadoClave.fechaFin > operativo.fechaFin){
//             await operativo.update({ fechaFin: resultadoClave.fechaFin });
//         }
//     }

//     let fechaInicio = dayjs(resultadoClave.fechaInicio);
//     let ultimoDiaCuatrimestre = fechaInicio.endOf('quarter').toDate();

//     if( resultadosClave.every( resultado => resultado.fechaFin < ultimoDiaCuatrimestre)){
//         await operativo!.update({ fechaFin: ultimoDiaCuatrimestre });
//     }

// }
