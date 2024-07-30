import Sequelize from "sequelize";
import database from "../../config/database";

export const PivotCategoriaProyecto = database.define('pivot_categoria_proyecto', {
    categoriaId: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    proyectoId: {
        type: Sequelize.INTEGER,
        allowNull: false,
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
      
    }
});
