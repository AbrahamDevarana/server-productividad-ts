import Sequelize from "sequelize";
import database from "../../config/database";


export interface ConfiguracionUsuarioAttributes {
    usuarioId: string;
    notificacionesWeb: boolean;
    notificacionesEmail: boolean;
    notificacionesEmailDiario: boolean;
    notificacionesEmailSemanal: boolean;
    notificacionesEmailMensual: boolean;
    notificacionesEmailTrimestral: boolean;
    portadaPerfil: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ConfiguracionUsuarioInstance extends Sequelize.Model<ConfiguracionUsuarioAttributes>, ConfiguracionUsuarioAttributes {}


const ConfiguracionUsuario = database.define<ConfiguracionUsuarioInstance>('configuracion_usuario', {
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
        type: Sequelize.TEXT,
        allowNull: true,
    },
}, {
    paranoid: true,
});

export default ConfiguracionUsuario;