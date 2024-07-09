import Sequelize, { InferAttributes, InferCreationAttributes, Model } from "sequelize";
import database from "../../config/database";

export interface MinutasHistoryModel extends Model<InferAttributes<MinutasHistoryModel>, InferCreationAttributes<MinutasHistoryModel>> {

    id?: number;
    minutaId: number;
    field: string;
    initialValue: string;
    finalValue: string;
    userId: string;
    date: Date;
}

export const MinutasHistory = database.define<MinutasHistoryModel>('history_minutas', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    minutaId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    field: {
        type: Sequelize.STRING,
        allowNull: false
    },
    initialValue: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    finalValue: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    userId: {
        type: Sequelize.UUID,
        allowNull: false
    },
    date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
}, {
    paranoid: true,
    timestamps: true,
    hooks: {
        beforeUpdate: async (minutaHistory: MinutasHistoryModel) => {
            minutaHistory.date = new Date();
        }
    }
});