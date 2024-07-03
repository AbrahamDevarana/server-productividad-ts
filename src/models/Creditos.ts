import Sequelize, { InferAttributes, InferCreationAttributes, Model } from "sequelize";
import database from "../config/database";
import { v4 as uuidv4 } from 'uuid';
import { Usuarios } from "./Usuarios";


export interface CreditosModel extends Model<InferAttributes<CreditosModel>, InferCreationAttributes<CreditosModel>> {

    id?: string;
    saldo: number;
    usuarioId: string
    createdAt?: Date;
    updatedAt?: Date;
}


export const Creditos = database.define<CreditosModel>('creditos', {
    id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: () => uuidv4()
    },
    saldo: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0
    },
    usuarioId: {
        type: Sequelize.UUID,
        unique: true
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
        afterFind: async (credito) => {           
        }
    },
    defaultScope: {
        attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
    },
});



async function inicializarCreditos() {
    const transaction = await database.transaction();
    try {
        const usuarios = await Usuarios.findAll({ transaction });
        for (const usuario of usuarios) {
            const credito = await Creditos.findOne({ where: { usuarioId: usuario.id }, transaction });
            if (!credito) {
                await Creditos.create({ usuarioId: usuario.id, saldo: 0 }, { transaction });
            }
        }
        await transaction.commit();
        console.log('Créditos inicializados para todos los usuarios.');
    } catch (error) {
        await transaction.rollback();
        console.error('Error inicializando créditos:', error);
    }
}

inicializarCreditos();
