import Sequelize from "sequelize";
import database from "../config/database";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from 'uuid';

export const Usuarios = database.define('usuarios', {
    id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: uuidv4(),
        unique: true
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
    iniciales: {
        type: Sequelize.STRING,
    },
    nombreCorto: {
        type: Sequelize.STRING,
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
    status: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    foto: {
        type: Sequelize.TEXT,
        allowNull: true
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
    departamentoId: {
        type: Sequelize.INTEGER,
    },
    leaderId: {
        type: Sequelize.UUID,
    },
    googleId: {
        type: Sequelize.STRING,
    },
    direccionId: {
        type: Sequelize.INTEGER,
    }
}, {
    paranoid: true,
    timestamps: true,
    hooks: {
        beforeCreate: async (usuario: any) => {
            usuario.password = await bcrypt.hash(usuario.password, 10);
            usuario.iniciales = `${usuario.nombre} ${usuario.apellidoPaterno} ${usuario.apellidoMaterno}`.normalize('NFD')
            .replace(/([^n\u0300-\u036f]|n(?!\u0303(?![\u0300-\u036f])))[\u0300-\u036f]+/gi,"$1")
            .normalize().concat(' ').replace(/([a-zA-Z]{0,} )/g, function(match){ return (match.trim()[0])}); 

            usuario.createdAt = new Date();
            usuario.updatedAt = new Date();
        },
        beforeSave: async (usuario: any) => {
            // if(usuario.leaderId) {
            //     const leader = await Usuarios.findOne({ where: { id: usuario.leaderId } });
            //     const usuarioArea = await usuario.getArea();
            //     const leaderArea = await leader.getArea();
            //     if(usuarioArea.id !== leaderArea.id && leaderArea.parentId !== usuarioArea.id) {
            //         throw new Error('El usuario no pertenece al mismo area o a un area padre del lider');
            //     }
            // }

            if(usuario.leaderId) {
                const leader = await Usuarios.findOne({ where: { id: usuario.leaderId } });
                const usuarioDepartamento = await usuario.getDepartamento();
                const leaderDepartamento = await leader.getDepartamento();
                if(usuarioDepartamento.areaId !== leaderDepartamento.areaId && usuarioDepartamento.areaId !== leaderDepartamento.area.parentId) {
                    throw new Error('El usuario no pertenece al mismo area o a un area padre del lider');
                }
            }
        },
        beforeUpdate: async (usuario: any) => {
            usuario.updatedAt = new Date();
        },
    },
    defaultScope: {
        attributes: { exclude: ['password', 'createdAt', 'updatedAt', 'deletedAt'] }
    },
});



