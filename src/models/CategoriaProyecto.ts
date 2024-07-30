import Sequelize from "sequelize";
import database from "../config/database";

export const CategoriaProyectos = database.define('categoria_proyectos', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    propietarioId: {
        type: Sequelize.UUID,
    },
    nombre: {
        type: Sequelize.TEXT,
    },
    orden: {
        type: Sequelize.INTEGER,
        defaultValue: 0
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
       afterFind: (categoria) => {
            // if(Array.isArray(categoria)) {
            //     console.log(categoria[0].__proto__);
            // }else {
            //     // @ts-ignore
            //     console.log(categoria.__proto__);
            // } 
            // getProyectos:
            // countProyectos:
            // hasProyecto:
            // hasProyectos:
            // setProyectos:
            // addProyecto:
            // addProyectos:
            // removeProyecto:
            // removeProyectos:
            // createProyecto:
         }
    }
});

