import Sequelize from "sequelize";
import database from "../config/database";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from 'uuid';
import { UsuarioInterface } from "../interfaces";
import slugify from "slugify";

export const Usuarios = database.define('usuarios', {
    id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: () => uuidv4()
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
    },
    slug: {
        type: Sequelize.STRING,
    },
    password: {
        type: Sequelize.TEXT,
        allowNull: false
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
        type: Sequelize.BIGINT,
    },
    puesto: {
        type: Sequelize.STRING,
        allowNull: true
    },
    descripcionPerfil: {
        type: Sequelize.TEXT,
    },
    responsabilidades: {
        type: Sequelize.TEXT,
    },
    status: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
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
        allowNull: true
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

            const slugName = slugify(`${usuario.nombre} ${usuario.apellidoPaterno}`, {
                lower: true,
                remove: /[*+~.()'"!:@]/g
            });

            usuario.slug = slugName + '-' + uuidv4().slice(0, 3);
        },
        beforeSave: async (usuario: any) => {
            if(usuario.leaderId) {
                // const leader = await Usuarios.findOne({ where: { id: usuario.leaderId } });
                // const usuarioDepartamento = await usuario.getDepartamento();
                // const leaderDepartamento = await leader.getDepartamento();
                // if(usuarioDepartamento.areaId !== leaderDepartamento.areaId && usuarioDepartamento.areaId !== leaderDepartamento.area.parentId) {
                //     throw new Error('El usuario no pertenece al mismo area o a un area padre del lider');
                // }
            }
        },
        beforeUpdate: async (usuario: any) => {
            usuario.updatedAt = new Date();
        },
    },
    defaultScope: {
        attributes: { exclude: ['password', 'createdAt', 'updatedAt', 'deletedAt' , 'googleId'] }
    },
});



