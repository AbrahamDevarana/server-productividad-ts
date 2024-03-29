import Sequelize, { InferAttributes, InferCreationAttributes, Model } from "sequelize";
import database from "../../config/database";

export interface PivotOpUsuarioModel extends Model<InferAttributes<PivotOpUsuarioModel>, InferCreationAttributes<PivotOpUsuarioModel>> {
    id?: number;
    idPivot?: number;
    usuarioId?: string;
    objetivoOperativoId?: string;
    propietario?: boolean;
    progresoAsignado?: number;
    progresoReal?: number;
    extra?: number;
    status?: 'ABIERTO' | 'PENDIENTE_APROBACION' | 'APROBADO' | 'SIN_APROBAR' | 'CANCELADO' | 'FINALIZADO'
    typeUpdated?: 'CREATED' | 'UPDATED' | 'DELETED';
    modifiedBy: string;
    createdAt?: Date;
    updatedAt?: Date;

    // __proto__

    
}

export const PivotOpUsuarioHistory = database.define<PivotOpUsuarioModel>('pivot_operativo_usuario', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    idPivot: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
    usuarioId: {
        type: Sequelize.UUID,
        allowNull: false,
    },
    objetivoOperativoId: {
        type: Sequelize.UUID,
        allowNull: false,
    },
    propietario: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    // Se refiere al valor que se asigna a un usuario para que cumpla con el objetivo
    progresoAsignado: { // Ponderacion
        type: Sequelize.FLOAT,
        allowNull: true,
        defaultValue: 0
    },
    // Se refiere al progreso que se va teniendo con base a los resultados clave
    progresoReal: { // Avance
        type: Sequelize.FLOAT,
        allowNull: true,
        defaultValue: 0
    },
    extra: {
        type: Sequelize.FLOAT,
        allowNull: true,
        defaultValue: 0
    },
    status: {
        type: Sequelize.ENUM('ABIERTO','PENDIENTE_APROBACION', 'APROBADO', 'SIN_APROBAR', 'CANCELADO', 'FINALIZADO' ), 
        allowNull: true,
        defaultValue: 'ABIERTO'
    },
    typeUpdated: {
        type: Sequelize.ENUM('CREATED', 'UPDATED', 'DELETED'),
        allowNull: true,
        defaultValue: 'CREATED'
    },
    modifiedBy: {
        type: Sequelize.UUID,
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

    hooks: {
        afterCreate: async () => {
        }
    }
});