import Sequelize from "sequelize";
import database from "../config/database";
import { Proyectos } from "./Proyectos";
import { Usuarios } from "./Usuarios";
import UsuarioHitosOrden from "./custom/UsuarioHitosOrden";


export const Hitos = database.define('hitos', {
    id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
    },
    titulo: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 'Nuevo Hito...'
    },
    descripcion: {
        type: Sequelize.TEXT,
        allowNull: true
    },
    fechaInicio: {
        type: Sequelize.DATE,
        allowNull: true
    },
    fechaFin: {
        type: Sequelize.DATE,
        allowNull: true
    },
    proyectoId: {
        type: Sequelize.UUID,
        allowNull: false
    },
    status: {
        type: Sequelize.STRING(12),
        defaultValue: 'SIN_INICIAR'
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
        // beforeUpdate: async (hito: any) => {
        //     hito.updatedAt = new Date();
        //     // Obtener el proyecto anterior
        //     const proyectoAnterior = await hito.getProyecto();
        //     const proyectoAnteriorId = proyectoAnterior.id;

        //     // Si el proyectoId del hito fue actualizado
        //     if (hito.changed('proyectoId')) {
        //         // Obtener el proyecto nuevo
        //         const proyectoNuevo = await Proyectos.findByPk(hito.proyectoId);

        //         // Obtener la lista de hitos del proyecto nuevo, ordenada por su campo "orden"
        //         const hitosNuevo = await proyectoNuevo.getHitos({
        //         order: [['orden', 'ASC']],
        //         });

        //         // Obtener el número de hitos en el proyecto nuevo
        //         const hitosCountNuevo = hitosNuevo.length;

        //         // Establecer el orden del hito como el último del proyecto nuevo
        //         const nuevoOrden = hitosCountNuevo + 1;

        //         // Actualizar el orden del hito en el nuevo proyecto para cada usuario
        //         const usuariosNuevo = await proyectoNuevo.getUsuariosProyecto();
        //         for (const usuario of usuariosNuevo) {
        //         await usuario.addOrdenHito(hito, { through: { orden: nuevoOrden } });
        //         }

        //         // Obtener la lista de hitos del proyecto anterior, ordenada por su campo "orden"
        //         const hitosAnterior = await proyectoAnterior.getHitos({
        //         order: [['orden', 'ASC']],
        //         });

        //         // Obtener el número de hitos en el proyecto anterior
        //         const hitosCountAnterior = hitosAnterior.length;

        //         // Establecer el orden del hito como el último del proyecto anterior
        //         const ultimoOrdenAnterior = hitosCountAnterior;
        //         const nuevoOrdenAnterior = ultimoOrdenAnterior > 1 ? ultimoOrdenAnterior - 1 : 1;

        //         // Actualizar el orden del hito en el proyecto anterior para cada usuario
        //         const usuariosAnterior = await proyectoAnterior.getUsuariosProyecto();
        //         for (const usuario of usuariosAnterior) {
        //         await usuario.addOrdenHito(hito, { through: { orden: nuevoOrdenAnterior } });
        //         }
        //     }
        // },
        afterCreate: async (hito: any) => {
            // console.log('afterCreate', Proyectos.prototype);
            // console.log('afterCreate', Usuarios.prototype);
            const proyecto = await hito.getHitosProyecto();
            // Obtener la lista de usuarios que participan en el proyecto
            const usuarios = await proyecto.getUsuariosProyecto();                    
            // Obtener el número de hitos en el proyecto
            const hitosCount = await proyecto.countProyectosHito();            

            // Establecer el orden del nuevo hito como el último
            const nuevoOrden = hitosCount + 1;
            // Actualizar el orden del nuevo hito para cada usuario en el proyecto


            for (const usuario of usuarios) {
                await usuario.addOrdenHito(hito, { through: { orden: nuevoOrden } });
            }

            // Agregar al propietarioId del priyecto a addOrdenHito
            const propietario = await proyecto.getPropietario();
            await propietario.addOrdenHito(hito, { through: { orden: nuevoOrden } });

        }, 

    },
    defaultScope: {
        attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
    },
});
