import Sequelize from "sequelize";
import database from "../../config/database";


const PivotObjetivoTacticoTrimestre = database.define('pivot_tactico_trimestre', {
    activo: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
    }
});



export default PivotObjetivoTacticoTrimestre;