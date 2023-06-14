// Path: src\models\Usuario.ts
import { Usuarios, Departamentos, Direccion, ObjetivoOperativos, Proyectos, ResultadosClave, Social, GaleriaUsuarios, ConfiguracionUsuario } from "../models";
import { Request, Response } from "express";
import { Op } from "sequelize";
import { getPagination, getPagingData } from "../helpers/pagination";
import dayjs from "dayjs";
import formidable, { Files, Fields } from 'formidable';
import { deleteFile, uploadFiles } from "../helpers/fileManagment";
import { UsuarioInterface } from "../interfaces";


const perfilInclude = [
    { model: Departamentos, as: 'departamento', include: ['area']}, 
    { model: Direccion, as: 'direccion' },
    { 
        model: ObjetivoOperativos, as: 'objetivosOperativos', 
        include: [
            { model: ResultadosClave, as:'resultadosClave' },
        ] 
    },
    { model: Proyectos, as: 'proyectos', through: { attributes: [] } },
    { model: Social, as: 'social'},
    { model: GaleriaUsuarios, as: 'galeria'},
    { model: ConfiguracionUsuario, as: 'configuracion'}
    
]

export const getUsuarios = async (req: Request, res: Response) => {
   

    const { nombre, apellidoPaterno, apellidoMaterno, email, page, size, search } = req.query;
    
    const { limit, offset } = getPagination(Number(page), Number(size));
    

    const where: any = {};  

    nombre && (where.nombre = { [Op.like]: `%${nombre}%` });
    apellidoPaterno && (where.apellidoPaterno = { [Op.like]: `%${apellidoPaterno}%` });
    apellidoMaterno && (where.apellidoMaterno = { [Op.like]: `%${apellidoMaterno}%` });
    email && (where.email = { [Op.like]: `%${email}%` });
    search && (where[Op.or] = [
        { nombre: { [Op.like]: `%${search}%` } },
        { apellidoPaterno: { [Op.like]: `%${search}%` } },
        { apellidoMaterno: { [Op.like]: `%${search}%` } },
    ]);


    try {
        const result = await Usuarios.findAndCountAll({
            where,
            include: [{model: Departamentos, as: 'departamento', include: ['area']}, 'direccion'],
            limit: size ? limit: undefined,
            offset: size ? offset: undefined,
        })

        const usuarios = getPagingData(result, Number(page), Number(size))
        res.json({ usuarios });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
};


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

export const getPerfil = async (req: Request, res: Response) => {

    const { slug } = req.params;

    try {
        const usuario = await Usuarios.findOne({
            where: { [Op.or]: [{ slug }, { id: slug }] },
            include: perfilInclude
        });

        if (usuario) {
            res.json({ usuario });
        } else {
            res.status(404).json({
                msg: `No existe ese usuario`
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
    const { nombre, apellidoPaterno, apellidoMaterno, email, telefono, descripcionPerfil, responsabilidades } = req.body;

    try {
        const usuario = await Usuarios.findByPk(id)

        if (!usuario) {
            return res.status(404).json({
                msg: 'No existe un usuario con el id ' + id
            });
        }

        await usuario.update({ nombre, apellidoPaterno, apellidoMaterno, email, telefono, descripcionPerfil, responsabilidades });            

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
        const { nombre, apellidoPaterno, apellidoMaterno, email, telefono, departamentoId, puesto, leaderId, fechaNacimiento, fechaIngreso, direccion = {}, descripcionPerfil } = req.body;
        
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

            const formatedFechaNacimiento = fechaNacimiento ? dayjs(new Date(fechaNacimiento)).format('YYYY-MM-DD') : null;
            const formatedFechaIngreso = fechaIngreso ? dayjs(new Date(fechaIngreso)).format('YYYY-MM-DD') : null;

            

            await usuario.update({ 
                nombre: nombre ? nombre : usuario.nombre,
                apellidoPaterno: apellidoPaterno ? apellidoPaterno : usuario.apellidoPaterno, 
                apellidoMaterno: apellidoMaterno ? apellidoMaterno : usuario.apellidoMaterno,
                email: email ? email : usuario.email,
                telefono: telefono ? telefono : usuario.telefono,
                departamentoId: departamentoId ? departamentoId : usuario.departamentoId,
                puesto: puesto ? puesto : usuario.puesto,
                leaderId: leaderId ? leaderId : usuario.leaderId,
                fechaNacimiento: formatedFechaNacimiento ? formatedFechaNacimiento : usuario.fechaNacimiento,
                fechaIngreso: formatedFechaIngreso ? formatedFechaIngreso : usuario.fechaIngreso,
                descripcionPerfil: descripcionPerfil ? descripcionPerfil : usuario.descripcionPerfil,
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

            const result = await uploadFiles(galeria, 'profile-picture', 500, 150 );

            if(result.length > 0){
                await usuario.update({ foto: result[0].url });
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