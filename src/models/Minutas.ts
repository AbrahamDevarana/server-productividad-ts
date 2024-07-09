import Sequelize, { InferAttributes, InferCreationAttributes, Model } from "sequelize";
import database from "../config/database";
import { MinutasHistory } from "./history/MinutasHistory";
import dayjs from "dayjs";

export interface MinutaModel extends Model<InferAttributes<MinutaModel>, InferCreationAttributes<MinutaModel>> {

    id?: number;
    titulo: string;
    descripcion: string;
    fecha: Date;
    minuteableId: string;
    minuteableType: 'PROYECTO' | 'OBJETIVO_OPERATIVO'
    authorId: string;
    createdAt?: Date;
    updatedAt?: Date;
}

type MinutaFields = "id" | "titulo" | "descripcion" | "fecha" | "minuteableId" | "minuteableType" | "authorId" | "createdAt" | "updatedAt";

export const Minuta = database.define<MinutaModel>('minutas', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    titulo: {
        type: Sequelize.STRING,
        allowNull: false
    },
    descripcion: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    fecha: {
        type: Sequelize.DATE,
        allowNull: false
    },
    minuteableId: {
        type: Sequelize.UUID,
        allowNull: false
    },
    minuteableType: {
        type: Sequelize.STRING(20),
        allowNull: false
    },
    authorId: {
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
        afterUpdate: async (minuta: MinutaModel) => {
          
        },
        beforeUpdate: async (minuta: MinutaModel) => {

            // minuta.updatedAt = new Date();
            // await minuta.save();

            const changedFields = minuta.changed() as (keyof MinutaModel)[] || [];

            for (const field of changedFields) {

                let previousValue = minuta.previous(field as MinutaFields);
                let finalValue = minuta.get(field as MinutaFields);

                if(field === 'fecha') {
                    continue;
                    previousValue = dayjs(previousValue).format('YYYY-MM-DD HH:mm:ss');
                    finalValue = dayjs(finalValue).format('YYYY-MM-DD HH:mm:ss');
                }

                
                await MinutasHistory.create({
                    minutaId: minuta.id!,
                    field,
                    initialValue: previousValue as string,
                    finalValue: finalValue as string,
                    userId: minuta.authorId,
                    date: new Date()
                });
            }
        }
    },
    defaultScope: {
        attributes: { exclude: ['createdAt', 'deletedAt'] }
    },
    scopes: {
        withProyecto: {
            where: {
                minuteableType: 'PROYECTO'
            }
        },
        withObjetivoOperativo: {
            where: {
                minuteableType: 'OBJETIVO_OPERATIVO'
            }
        }
    }
}) 