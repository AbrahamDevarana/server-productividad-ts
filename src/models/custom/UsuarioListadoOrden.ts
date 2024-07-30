import Sequelize from "sequelize";
import database from "../../config/database";


const UsuarioListadosOrden = database.define('usuarios_listados_orden', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },

    usuarioId: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false
    },
    listadoId: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false
    },
    orden: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
}, {
    paranoid: true,
});

export default UsuarioListadosOrden;


            