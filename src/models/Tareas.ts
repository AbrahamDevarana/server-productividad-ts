import Sequelize from "sequelize";
import database from "../config/database";
import { Hitos } from "./Hitos";

export const Tareas = database.define('tareas', {
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
        allowNull: true
    },
    status: {
        type: Sequelize.STRING(12),
        defaultValue: 'SIN_INICIAR'
    },
    propietarioId: {
        type: Sequelize.UUID,
        allowNull: false
    },
    hitoId: {
        type: Sequelize.UUID,
        allowNull: false
    },
    fechaInicio: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
    },
    fechaFin: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
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
        beforeUpdate: async (tarea: any) => {
            tarea.updatedAt = new Date();
        },
        afterUpdate: async (tarea: any) => {
            const hito = await Hitos.findByPk(tarea.hitoId);
            const tareas = await hito.getTareas();

            if (hito) {
                const proyecto = await hito.getHitosProyecto();

                const fechaFinalProyecto = proyecto.fechaFin;
                const fechaInicioProyecto = proyecto.fechaInicio;
     
                tareas.forEach(async (tarea: any) => {
                    
                    // Si la fechaFinal de la tarea es mayor a la fechaFinal del proyecto, actualizar la fechaFinal del proyecto
                    if (tarea.fechaFin > fechaFinalProyecto) {
                        await proyecto.update({ fechaFin: tarea.fechaFin });
                    }

                    // Si la fechaInicio de la tarea es menor a la fechaInicio del proyecto, actualizar la fechaInicio del proyecto
                    if (tarea.fechaInicio < fechaInicioProyecto) {
                        await proyecto.update({ fechaInicio: tarea.fechaInicio });
                    }                    
                })

           }
        },
        afterCreate: async (tarea: any) => {

        }
        
    },

    defaultScope: {
        attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
    },
});

