import Sequelize from "sequelize";
import database from "../config/database";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from 'uuid';
import slugify from "slugify";

export const Usuarios = database.define('usuarios', {
    id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: uuidv4()
    },
    nombre: {
        type: Sequelize.STRING,
        allowNull: false
    },
    apellidoPaterno: {
        type: Sequelize.STRING,
        allowNull: false
    },
    apellidoMaterno: {
        type: Sequelize.STRING,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    iniciales: {
        type: Sequelize.STRING,
    },
    status: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    fechaNacimiento: {
        type: Sequelize.DATE,
    },
    fechaIngreso: {
        type: Sequelize.DATE,
    },
    telefono: {
        type: Sequelize.INTEGER,
    },
    descripcionPerfil: {
        type: Sequelize.TEXT,
    },
    areaId: {
        type: Sequelize.INTEGER,
    },
    leaderId: {
        type: Sequelize.INTEGER,
    },
    googleId: {
        type: Sequelize.STRING,
    },
    createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
    updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    }
}, {
    paranoid: true,
    hooks: {
        beforeCreate: async (usuario: any) => {
            usuario.password = await bcrypt.hash(usuario.password, 10);
            usuario.iniciales = `${usuario.nombre} ${usuario.apellidoPaterno} ${usuario.apellidoMaterno}`.normalize('NFD')
            .replace(/([^n\u0300-\u036f]|n(?!\u0303(?![\u0300-\u036f])))[\u0300-\u036f]+/gi,"$1")
            .normalize().concat(' ').replace(/([a-zA-Z]{0,} )/g, function(match){ return (match.trim()[0])}); 
        },
        beforeUpdate: async (usuario: any) => {
            usuario.updatedAt = new Date();
        }
    }
});


