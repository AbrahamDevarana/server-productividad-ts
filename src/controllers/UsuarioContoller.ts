// Path: src\models\Usuario.ts
import { Usuarios, Departamentos, Direccion, ObjetivoOperativos, Proyectos, ResultadosClave, ConfiguracionUsuario } from "../models";
import { Request, Response } from "express";
import { Op, literal } from "sequelize";
import { getPagination, getPagingData } from "../helpers/pagination";
import dayjs from "dayjs";
import formidable, { Files, Fields } from 'formidable';
import { deleteFile, uploadFile } from "../helpers/fileManagment";
import { UsuarioInterface } from "../interfaces";


const perfilInclude = [
    { model: Departamentos, as: 'departamento', include: ['area']}, 
    { model: Direccion, as: 'direccion' },
    { 
        model: ObjetivoOperativos, as: 'objetivosOperativos', 
        include: [
            { model: ResultadosClave, as:'resultadosClave' },
            { model: Usuarios, as: 'operativosResponsable' }
        ] 
    },
    { model: Proyectos, as: 'proyectos', through: { attributes: [] } },
]

export const getUsuarios = async (req: Request, res: Response) => {
   

    const { page, size, search } = req.query;

    try {
        const result = await Usuarios.findAndCountAll({
            distinct: true,
            include: [{model: Departamentos, as: 'departamento', include: ['area']}, 'direccion'],
            order: [
                ['nombre', 'ASC'],
            ],
            where: {
                [Op.and]: [
                    search ? {
                        [Op.or]: [
                            literal('CONCAT(usuarios.nombre, " ", apellidoPaterno) LIKE :search'),
                            literal('CONCAT(usuarios.nombre, " ", apellidoMaterno) LIKE :search'),
                            literal('CONCAT(usuarios.nombre, " ", apellidoPaterno, " ", apellidoMaterno) LIKE :search'),
                            literal('usuarios.nombre LIKE :search'),
                            literal('usuarios.apellidoPaterno LIKE :search'),
                            literal('usuarios.apellidoMaterno LIKE :search'),
                            literal('usuarios.email LIKE :search'),
                        ],
                    } : {},
                    { status: true}
                ]
            },
            replacements: {
                search: `%${search}%`
            },
        })

        const usuarios = getPagingData(result, Number(page), Number(size))    
        
        res.json({ usuarios });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const getUsuario = async (req: Request, res: Response) => {
    
        const { id } = req.params;
       
    
        try {
            const usuario = await Usuarios.findByPk(id,
                { 
                    include: [{model: Departamentos, as: 'departamento', include: ['area']}, 'direccion'],
                }
            );
            if (usuario) {                
                res.json({ usuario });
            } else {
                res.status(404).json({
                    msg: `No existe un usuario con el id ${id}`
                });
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({
                msg: 'Hable con el administrador'
            });
        }
}


export const updatePerfil = async (req: Request, res: Response) => {
        
    const { id } = req.params;
    const { nombre, apellidoPaterno, apellidoMaterno, email, telefono, descripcionPerfil, responsabilidades, social } = req.body;


    try {
        const usuario = await Usuarios.findByPk(id)

        if (!usuario) {
            return res.status(404).json({
                msg: 'No existe un usuario con el id ' + id
            });
        }

        await usuario.update({ nombre, apellidoPaterno, apellidoMaterno, email, telefono, descripcionPerfil, responsabilidades, social });            

        await usuario.reload({
            include: perfilInclude
        });


        res.json({usuario});

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const createUsuario = async (req: Request, res: Response) => {
        
    const { nombre, apellidoPaterno, apellidoMaterno, email, telefono } = req.body;    

    try {
        const existeEmail = await Usuarios.findOne({
            where: {
                email
            }
        });

        if (existeEmail) {
            return res.status(400).json({
                msg: 'Ya existe un usuario con el email ' + email
            });
        }

        const usuario = Usuarios.build({ nombre, apellidoPaterno, apellidoMaterno, email, telefono, password: '123456' });
        await usuario.save();

        // 

        await usuario.reload({
            include: [{model: Departamentos, as: 'departamento', include: ['area']}, 'direccion'],
        });

        res.json({usuario});

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const updateUsuario = async (req: Request, res: Response) => {
        
        const { id } = req.params;
        const { nombre, apellidoPaterno, apellidoMaterno, email, telefono, departamentoId , puesto, fechaNacimiento, fechaIngreso, direccion = {}, descripcionPerfil, leaderId} = req.body;
        
        try {
            const usuario = await Usuarios.findByPk(id,
                {
                    include: [{model: Departamentos, as: 'departamento', include: ['area']}, 'direccion'],
                });
    
            if (!usuario) {
                return res.status(404).json({
                    msg: 'No existe un usuario con el id ' + id
                });
            }

            const formatedFechaNacimiento = fechaNacimiento ? dayjs(fechaNacimiento).toDate() : null;
            const formatedFechaIngreso = fechaIngreso ? dayjs(fechaIngreso).toDate() : null;


            await usuario.update({ 
                nombre: nombre ? nombre : usuario.nombre,
                apellidoPaterno: apellidoPaterno ? apellidoPaterno : usuario.apellidoPaterno, 
                apellidoMaterno: apellidoMaterno ? apellidoMaterno : usuario.apellidoMaterno,
                email: email ? email : usuario.email,
                telefono: telefono ? telefono : usuario.telefono,
                puesto: puesto ? puesto : usuario.puesto,
                fechaNacimiento: formatedFechaNacimiento ? formatedFechaNacimiento : usuario.fechaNacimiento,
                fechaIngreso: formatedFechaIngreso ? formatedFechaIngreso : usuario.fechaIngreso,
                descripcionPerfil: descripcionPerfil ? descripcionPerfil : usuario.descripcionPerfil,
                leaderId: leaderId ? leaderId : usuario.leaderId,
                departamentoId: departamentoId ? departamentoId : usuario.departamentoId
            });            

            if(direccion){

                const { codigoPostal = null, colonia = null, calle = null, numeroExterior = null, numeroInterior = null, estado = null, ciudad = null } = direccion;  

                if (usuario.direccion) {
                    await usuario.direccion.update({ 
                        codigoPostal, 
                        colonia, 
                        calle, 
                        numeroExterior, 
                        numeroInterior, 
                        estado, 
                        ciudad 
                    });
                } else {
                    await usuario.createDireccion({ codigoPostal, colonia, calle, numeroExterior, numeroInterior, estado, ciudad });
                }
            }


            // if(despartamentos){
            //     await usuario.setDepartamentos(despartamentos);
            // }

            await usuario.reload({
                include: [{model: Departamentos, as: 'departamento', include: ['area']}, 'direccion'],
            });

            res.json({usuario});
    
        } catch (error) {
            console.log(error);
            res.status(500).json({
                msg: 'Hable con el administrador'
            });
        }
}

export const deleteUsuario = async (req: Request, res: Response) => {
            
    const { id } = req.params;

    try {
        const usuario = await Usuarios.findByPk(id);

        if (!usuario) {
            return res.status(404).json({
                msg: 'No existe un usuario con el id ' + id
            });
        }

        await usuario.destroy();

        res.json({usuario});

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

export const uploadPhoto = async (req: Request, res: Response) => {

    const form = formidable ({ multiples: true });
    const {id } = req.params;    
    
    form.parse(req, async (err: Error, fields: Fields, files: Files) => {

    
        if (err) {
            console.error(err);
            res.status(500).send(err);
            return;
        }
       
      
        const galeria = Object.values(files)

        try {
            const usuario = await Usuarios.findByPk(id);

            if (!usuario) {
                return res.status(404).json({
                    msg: 'No existe un usuario con el id ' + id
                });
            }

            const result = await uploadFile({ files: galeria, folder: 'profile-picture' });

            if(result.length > 0){
                await usuario.update({ foto: result[0].url });
            }
             
            await usuario.reload({
                include: perfilInclude
            });

            res.json({usuario});

        } catch (error) {
            console.log(error);
            res.status(500).json({
                msg: 'Hable con el administrador'
            });
        }
    })

    
        

}

export const deletePhoto = async (req: Request, res: Response) => {

    const { id } = req.params;

    try {
        const usuario = await Usuarios.findByPk(id);

        if (!usuario) {
            return res.status(404).json({
                msg: 'No existe un usuario con el id ' + id
            });
        }

        const photoDelete = usuario.foto;
        
        const result = await usuario.update({ foto: null });

        if(result){
            const responseDelete = await deleteFile([photoDelete]);

            if(!responseDelete){
                return res.status(500).json({
                    msg: 'No se pudo eliminar la imagen'
                });
            }
        }
        
        res.json({
            ok: true,
            status: 200,
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }

}

export const uploadConfiguracion = async (req: Request, res: Response) => {
    
    const { id } = req.user as UsuarioInterface;
    const { notificacionesWeb, 
            notificacionesEmail, 
            notificacionesEmailDiario, 
            notificacionesEmailSemanal, 
            notificacionesEmailMensual, 
            notificacionesEmailTrimestral,
            portadaPerfil
        } = req.body
    

    try {
    
        const configUsuario = await ConfiguracionUsuario.findOrCreate({ 
            where: { usuarioId: id },
            defaults: {
                usuarioId: id,
                notificacionesWeb,
                notificacionesEmail,
                notificacionesEmailDiario,
                notificacionesEmailSemanal,
                notificacionesEmailMensual,
                notificacionesEmailTrimestral,
                portadaPerfil
            }
        });

        if(!configUsuario[1]){
            await configUsuario[0].update({ 
                notificacionesWeb: notificacionesWeb ? notificacionesWeb : configUsuario[0].notificacionesWeb,
                notificacionesEmail : notificacionesEmail ? notificacionesEmail : configUsuario[0].notificacionesEmail,
                notificacionesEmailDiario : notificacionesEmailDiario ? notificacionesEmailDiario : configUsuario[0].notificacionesEmailDiario,
                notificacionesEmailSemanal : notificacionesEmailSemanal ? notificacionesEmailSemanal : configUsuario[0].notificacionesEmailSemanal,
                notificacionesEmailMensual : notificacionesEmailMensual ? notificacionesEmailMensual : configUsuario[0].notificacionesEmailMensual,
                notificacionesEmailTrimestral : notificacionesEmailTrimestral ? notificacionesEmailTrimestral : configUsuario[0].notificacionesEmailTrimestral,
                portadaPerfil : portadaPerfil ? portadaPerfil : configUsuario[0].portadaPerfil
            });
        }


        const usuario = await Usuarios.findByPk(id, {
            include: perfilInclude
        });
        

      

        res.json({ usuario });


    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });   
    }
}

export const getUsuarioProgress = async (req: Request, res: Response) => {

    const { year, quarter, usuarioId } = req.body;


        try {

           const usuario = await Usuarios.findOne({
                where: {
                    id: usuarioId
                },
                attributes: ['id'],
                include: [
                    {
                        model: ObjetivoOperativos,
                        as: 'objetivosOperativos',
                        attributes: ['id', 'nombre', 'year', 'quarter'],
                        through: {
                            attributes: ['progresoAsignado', 'progresoReal'],
                            as: 'progreso'
                        },
                        where: {
                            year,
                            quarter
                        }
                    },
                ]
           })

              if(!usuario){
                return res.status(404).json({
                    msg: 'No existe un usuario con el id ' + usuarioId
                });
            }

            res.json({usuario});
       
        } catch (error) {
            console.log(error);
            res.status(500).json({
                msg: 'Hable con el administrador'
            });
        }
}

