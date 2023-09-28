import Sequelize from "sequelize";
import database from "../config/database";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from 'uuid';
import slugify from "slugify";
import ConfiguracionUsuario from "./custom/ConfiguracionUsuario";


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
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
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
        allowNull: true
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

            const slugName = slugify(`${usuario.nombre} ${usuario.apellidoPaterno}`, {
                lower: true,
                remove: /[*+~.()'"!:@]/g
            });

            usuario.slug = slugName + '-' + uuidv4().slice(0, 3);
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
        },            
    },
    defaultScope: {
        attributes: { exclude: ['password', 'createdAt', 'updatedAt', 'deletedAt' , 'googleId'] }
    },
});




// INSERT INTO usuarios (id, nombre, apellidoPaterno, apellidoMaterno, email) VALUES
// ('9e477bbc-f89e-4e34-ac67-dc1abd3846db','Fátima Zaid', 'Benitez ', 'Ortíz',  'fatimaortiz@devarana.mx'),
// ('f95207f2-19be-4975-95bb-cb9c7315b0ec','Maximiliano', 'Gonzalez', 'Rivadeneyra',  'maximilianogonzalez@devarana.mx'),
// ('2583a21a-160d-4d02-894c-396a92cb8551','Abraham', 'Alvarado ', 'Guevara',  'abrahamalvarado@devarana.mx'),
// ('daed5e50-93ed-4702-a490-88f8a4167365','Hector', 'Bonilla', 'Feregrino', 'Hectorbonilla@devarana.mx'), 
// ('1f383801-c130-48c3-a1f5-bae1b118309d','Diego Armando ', 'Mondragón', 'Colín', 'diegomondragon@devarana.mx'), 
// ('b3839e61-928b-4ef6-a201-745e4a4d4c23','Ximena ', 'Paramo ', 'Espinoza', 'ximenaparamo@devarana.mx '), 
// ('b0a76dd4-8ccf-4a37-80c1-30a04bbf47e3','Miguel Angel', 'Barajas ', 'Remigio ', 'miguelbarajas@devarana.mx'), 
// ('e62667ac-ea7e-472d-9359-24c0a8c4708c','Ana Lucia', 'Mendoza', 'Moreno', 'luciamendoza@devarana.mx'), 
// ('9cead3d3-23b1-441f-81dc-6b5ce09e7020','Mariana', 'De la Sota Riva', 'Curiel ', 'marianadelasotariva@devarana.mx'), 
// ('dad9e1e1-090f-4aaa-9fb5-1ba4e4691013','Ana Cecilia', 'Galván', 'Flores', 'ceciliagalvan@devarana.mx '), 
// ('1775cbac-2678-4667-9438-4ec5efbc211f','Cecilia Berenice', 'Barroso', 'Alcocer', 'ceciliabarroso@devarana.mx '), 
// ('0afb5247-4e01-48cb-9d3f-34c3a3588e42','Luis Gerardo', 'Rubio ', 'Villa', 'luisrubio@devarana.mx '), 
// ('12737c2a-ad62-4f52-8c72-7e16fc74aa14','Santiago ', 'Alarcón ', 'Reynoso', 'santiagoalarcon@devarana.mx '), 
// ('c516c2e6-7a14-41e4-a7fb-21dff40c78bd','Manuel Alejandro ', 'Bermudes', 'Calleja', 'alejandrobermudes@devarana.mx'), 
// ('98e93b04-50c1-4876-8926-5513e608d235','Patricia ', 'Arellanos', 'Acosta', 'patriciaarellanos@devarana.mx '), 
// ('2275e125-ea9b-4768-8c90-b975cfd63acc','Shadia', 'Sánchez', 'Nahed', 'shadiasanchez@devarana.mx '), 
// ('fa6489f3-fc46-4d76-9662-a724eef84bfa','Wendy ', 'Herrera', 'Palacios', 'wendyherrera@devarana.mx '), 
// ('bd81f91d-594c-49ba-9946-1cb09af74ad4','Abraham ', 'Arteaga', 'Cordero', 'abrahamarteaga@devarana.mx '), 
// ('112ab206-de31-4e3a-a15a-2b924b9eb249','Adolfo Arturo', 'Villagrán', 'Becerril ', 'adolfovillagran@devarana.mx'), 
// ('54894269-2c3f-4708-baf5-f374ac949cfc','Arturo ', 'Cruz', 'Uribe', 'arturocruz@devarana.mx '), 
// ('d8f0695f-a9a7-4b16-898e-4e00727df5e2','Leticia Melisa', 'Muñoz', 'Hernández', 'melisamunoz@devarana.mx'), 
// ('3d0fc275-158e-4160-ba15-584b5556d5fd','Rodrigo', 'Cristo', 'Días de León ', 'rodrigocristo@devarana.mx'), 
// ('fd1e274d-8026-4b00-844c-b492c77363f5','Diego Andrés', 'Arías', 'Hernández', 'diegoarias@devarana.mx'), 
// ('bfc6acc4-5468-401e-a8a7-7f191c0b020e','Adriana ', 'Salinas', 'López', 'adrianasalinas@devarana.mx'), 
// ('cba3d4e6-1e43-43a9-9c7e-c61fd110c60b','Luis Roberto', 'Evangelista', 'Galván ', 'robertoevangelista@devarana.mx'), 
// ('1c90dfc9-e60b-4501-ad23-54b67f232d6b','Alan Ulises', 'García ', 'Pedraza', 'alangarcia@devarana.mx'), 
// ('81142f14-a285-4d27-96dd-6d3961cd3172','Luis Jesús', 'Hernández', 'Pacheco', 'luishernandez@devarana.mx'), 
// ('c18e60e8-aba1-4b51-b48e-01383ee6f834','Itxchel Valeria', 'Gallegos', 'Guerrero', 'valeriagallegos@devarana.mx'), 
// ('00629732-4184-4198-b307-aa150d930360','José Antonio', 'Olvera', 'Contreras', 'antonioolvera@devarana.mx'), 
// ('7e8b98f7-2bcc-4862-9af6-8c245149ec80','Nuria', 'Espino', 'Ferrusquia', 'nuriaespino@devarana.mx'), 
// ('a88268a8-773e-413a-b902-2229c5956872','Estefania', 'Dominguez', 'Guadarrama', 'atencionaclientes@devarana.mx'), 
// ('ca0b21fd-b4bd-4be1-8cf8-2de92801bdd3','Itze Arcelia', 'Vega', 'Estrada', 'direccioncomercial@devarana.mx'), 
// ('fc244da2-e7e7-4a60-bc46-a61c4e951d74','Gustavo ', 'Ruiz Velasco', 'Komatsuzaki', 'ruizvelasco@devarana.mx'), 
// ('07b9cfa4-4efe-4402-b28c-d160795d8299','Gustavo Adolfo ', 'Guerrero', 'Barajas', 'gustavoguerrero@devarana.mx'), 
// ('0154a50c-80a5-4e66-ab1b-a352c6ef5cfd','Gregorio ', 'León ', 'Díaz Barriga', 'gregorioleon@devarana.mx'), 
// ('b9090e3d-ba1a-413e-8f24-4b16ccc11f3b','Carlos', 'Tahuilán', 'Aguilar', 'carlostahuilan@devarana.mx'), 
// ('304428c4-002d-4513-bd8a-dcc150579f81','Pamela', 'Jara', 'Pamela', 'recepcion@devarana.mx'), 
// ('9d838a89-c3a2-4883-a5a7-12cdf6fed44c','Karen Lizbeth', 'Salinas', 'Aguirre', 'karensalinas@devarana.mx'), 
// ('71cf420e-e433-46bb-98e3-3d51d39436e6','José Manuel', 'Jimenez', 'Solis', 'josejimenez@devarana.mx'), 
// ('9adfaf2a-ddf6-4a23-b526-f8a40483a85f','Luis ', 'Segoviano ', 'Pichardo', 'luissegoviano@devarana.mx'), 
// ('b2dd1c2e-f382-4f68-bade-2e43e1983e27','Mariana', 'Dominguez', 'Acebo', 'marianadominguez@devarana.mx'), 
// ('aa599681-a298-401e-b393-4f5c01242127','Samuel Omar', 'Quintana', 'González', 'compras2@devarana.mx'), 
// ('3d5b6c66-d4a7-492b-aa68-ec3cb840d403','Carlos Giovanny', 'Varela', 'Solis', 'carlosvarela@devarana.mx'), 
// ('ba39d695-1321-44ed-86f4-849c274cb162','Diego Alejandro', 'Flores', 'Herrejón ', 'auxiliaralmacen@devarana.mx'), 
// ('19934e79-db39-404e-be29-cd059ce2f591','Javier Antonio', 'Mendoza', 'Sánchez', 'almacen@devarana.mx'), 
// ('2c8c3047-290a-4337-a627-2da9a26e6807','Ofelia del Carmén', 'Sotelo', 'Rosas', 'contabilidad2@devarana.mx'), 
// ('f3074693-6810-449a-9ae1-594e2e31a1c1','Jorge', 'Aceves', 'Ruelas', 'jorgeaceves@devarana.mx'), 
// ('0bab1444-2d84-4100-be88-f14282e64e35','Susana', 'Jimenez', 'Martínez', 'contabilidad@devarana.mx'), 
// ('c8dab44b-f57d-41cf-99c5-66bf418a9321','Diana Carolina', 'López', 'Otega', 'titulacion@devarana.mx'), 
// ('c365c66b-a714-49fc-a6dd-b00230390002','Mariana', 'Hernández', 'Ramos', 'marianahernandez@devarana.mx'), 
// ('4f78aa27-2cac-4692-822b-68edc8926b50','Adriana María', 'Del Ángel', 'García', 'adrianadelangel@devarana.mx'), 
// ('77ed8e8a-2840-4c7f-b000-4bb18e4243d9','Lucas', 'Stolk', 'N/A', 'lucas@devarana.mx');