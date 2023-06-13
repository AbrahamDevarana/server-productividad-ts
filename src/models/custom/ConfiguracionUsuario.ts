import Sequelize from "sequelize";
import database from "../../config/database";

const ConfiguracionUsuario = database.define('configuracion_usuario', {
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
    notificacionesWeb: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    notificacionesEmail: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    notificacionesEmailDiario: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    notificacionesEmailSemanal: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    notificacionesEmailMensual: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    notificacionesEmailTrimestral: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    portadaPerfil: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
}, {
    paranoid: true,
});

export default ConfiguracionUsuario;