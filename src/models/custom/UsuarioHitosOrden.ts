import Sequelize from "sequelize";
import database from "../../config/database";


const UsuarioHitosOrden = database.define('usuarios_hitos_orden', {
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
    hitoId: {
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

export default UsuarioHitosOrden;


            