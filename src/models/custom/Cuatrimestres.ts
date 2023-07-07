import Sequelize from "sequelize";
import database from "../../config/database";

const Cuatrimestre = database.define('Cuatrimestre', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    year: {
      type: Sequelize.INTEGER,
      allowNull: false,
      validate: {
        isNumeric: true,
        len: [4, 4]  // Asegúrate de que el año tenga exactamente 4 dígitos.
      }
    },
    cuatrimestre: {
      type: Sequelize.INTEGER,
      allowNull: false,
      validate: {
        isNumeric: true,
        min: 1,  // Cuatrimestre mínimo es 1.
        max: 3   // Cuatrimestre máximo es 3.
      }
    },
});

export default Cuatrimestre;