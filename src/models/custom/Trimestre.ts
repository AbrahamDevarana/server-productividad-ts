import Sequelize from "sequelize";
import database from "../../config/database";

const Trimestre = database.define('trimestre', {
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
    trimestre: {
      type: Sequelize.INTEGER,
      allowNull: false,
      validate: {
        isNumeric: true,
        min: 1,  // Cuatrimestre mínimo es 1.
        max: 4   // Cuatrimestre máximo es 4.
      }
    },
});

export default Trimestre;