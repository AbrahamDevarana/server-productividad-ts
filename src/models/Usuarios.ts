import Sequelize, { Model, HasManyGetAssociationsMixin, HasManyCountAssociationsMixin, HasManyHasAssociationMixin, HasManyHasAssociationsMixin, HasManySetAssociationsMixin, HasManyAddAssociationMixin, HasManyAddAssociationsMixin, HasManyRemoveAssociationMixin, HasManyRemoveAssociationsMixin, HasOneGetAssociationMixin, HasOneSetAssociationMixin, HasOneCreateAssociationMixin, BelongsToSetAssociationMixin, BelongsToCreateAssociationMixin, HasManyCreateAssociationMixin, BelongsToGetAssociationMixin } from "sequelize";
import database from "../config/database";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from 'uuid';
import slugify from "slugify";
import ConfiguracionUsuario from "./custom/ConfiguracionUsuario";
import { Creditos } from "./Creditos";
import { UsuarioInterface } from "../interfaces";
import { DepartamentosInterface } from "./Departamentos";

export interface UsuarioInstance extends Model<UsuarioInterface>, UsuarioInterface {
    getSubordinados: HasManyGetAssociationsMixin<UsuarioInstance>;
    countSubordinados: HasManyCountAssociationsMixin;
    hasSubordinado: HasManyHasAssociationMixin<UsuarioInstance, number>;
    hasSubordinados: HasManyHasAssociationsMixin<UsuarioInstance, number>;
    setSubordinados: HasManySetAssociationsMixin<UsuarioInstance, number>;
    addSubordinado: HasManyAddAssociationMixin<UsuarioInstance, number>;
    addSubordinados: HasManyAddAssociationsMixin<UsuarioInstance, number>;
    removeSubordinado: HasManyRemoveAssociationMixin<UsuarioInstance, number>;
    removeSubordinados: HasManyRemoveAssociationsMixin<UsuarioInstance, number>;
    createSubordinado: HasManyCreateAssociationMixin<UsuarioInstance>;
  
    // Métodos para líder (belongsTo)
    getLider: BelongsToGetAssociationMixin<UsuarioInstance>;
    setLider: BelongsToSetAssociationMixin<UsuarioInstance, number>;
    createLider: BelongsToCreateAssociationMixin<UsuarioInstance>;
  
    // Métodos para departamento (belongsTo)
    getDepartamento: BelongsToGetAssociationMixin<DepartamentosInterface>;
    setDepartamento: BelongsToSetAssociationMixin<DepartamentosInterface, number>;
    createDepartamento: BelongsToCreateAssociationMixin<DepartamentosInterface>;
  
    // Métodos para dirección (belongsTo)
    // getDireccion: BelongsToGetAssociationMixin<DireccionInstance>;
    // setDireccion: BelongsToSetAssociationMixin<DireccionInstance, number>;
    // createDireccion: BelongsToCreateAssociationMixin<DireccionInstance>;
  
    // Métodos para proyectos (belongsToMany)
    // getProyectos: BelongsToManyGetAssociationsMixin<ProyectoInstance>;
    // countProyectos: BelongsToManyCountAssociationsMixin;
  
}


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
    },
    apellidoMaterno: {
        type: Sequelize.STRING,
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
        type: Sequelize.ENUM('ACTIVO', 'INACTIVO', 'ELIMINADO'),
        allowNull: false,
        defaultValue: 'ACTIVO'
    },
    leaderId: {
        type: Sequelize.UUID,
    },
    encargadoId: {
        type: Sequelize.UUID,
    },
    googleId: {
        type: Sequelize.STRING,
    },
    direccionId: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
    rolId :{
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 2
    },
    isEvaluable: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
    updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
    social: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: {"otros": {"url": "mybook/", "nombre": "otros"}, "facebook": {"url": "www.facebook.com", "nombre": "facebook"}, "linkedin": {"url": "www.linkedin.com", "nombre": "linkedin"}, "instagram": {"url": "www.instagram.com/", "nombre": "instagram"}}
    }
}, {
    paranoid: true,
    timestamps: true,
    hooks: {
        afterFind: async (usuarios: any) => {
            if(usuarios){
                // if(Array.isArray(usuarios)){
                //     // @ts-ignore
                //     console.log('usuarios', usuarios.__proto__);
                    
                // } else {
                //     console.log('usuarios', usuarios.__proto__);
                // }
            }
        },
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

            if(!usuario.fechaIngreso){
                usuario.fechaIngreso = new Date();
            }
            if(!usuario.fechaNacimiento){
                usuario.fechaNacimiento = new Date();
            }
            
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

            const slugName = slugify(`${usuario.nombre} ${usuario.apellidoPaterno}`, {
                lower: true,
                remove: /[*+~.()'"!:@]/g
            });

            usuario.slug = slugName + '-' + uuidv4().slice(0, 3);

            if(!usuario.fechaIngreso){
                usuario.fechaIngreso = new Date();
            }
            if(!usuario.fechaNacimiento){
                usuario.fechaNacimiento = new Date();
            }
        },
        afterCreate: async (usuario: any) => {
            await ConfiguracionUsuario.create({
                usuarioId: usuario.id,
                notificacionesWeb: false,
                notificacionesEmail: false,
                notificacionesEmailDiario: false,
                notificacionesEmailSemanal: false,
                notificacionesEmailMensual: false,
                notificacionesEmailTrimestral: false,
                portadaPerfil: '',
            });

            const transaction = await database.transaction();
            try {
                await Creditos.create({ usuarioId: usuario.id, saldo: 0 }, { transaction });
                await transaction.commit();
            } catch (error) {
                await transaction.rollback();
                throw error;
            }
        },
    },
    defaultScope: {
        attributes: { exclude: ['password', 'createdAt', 'updatedAt', 'deletedAt' , 'googleId'] }
    },
});