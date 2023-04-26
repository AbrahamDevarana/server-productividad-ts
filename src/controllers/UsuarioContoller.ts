// Path: src\models\Usuario.ts
import { Usuarios, Departamentos } from "../models";
import { Request, Response } from "express";
import { Op } from "sequelize";
import { getPagination, getPagingData } from "../helpers/pagination";
import dayjs from "dayjs";
import formidable, { Files, Fields } from 'formidable';
import { deleteFile, uploadFiles } from "../helpers/fileManagment";

export const getUsuarios = async (req: Request, res: Response) => {
   

    const { nombre, apellidoPaterno, apellidoMaterno, email, page = 0, size = 10, search } = req.query;
    
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
            // limit,
            // offset            
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
        const { nombre, apellidoPaterno, apellidoMaterno, email, telefono, 
            departamentoId = null, puesto = null, leaderId = null,
            fechaNacimiento = null, fechaIngreso = null, direccion = {}
        } = req.body;

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

            // const formatFechaNacimiento = fechaNacimiento ? dayjs(new Date(fechaNacimiento)).format('YYYY-MM-DD HH:mm:ss') : null;
            // const formatFechaIngreso = fechaIngreso ? dayjs(new Date(fechaIngreso)).format('YYYY-MM-DD HH:mm:ss') : null;
            
            await usuario.update({ nombre, apellidoPaterno, apellidoMaterno, email, telefono, departamentoId, puesto, leaderId, fechaNacimiento, fechaIngreso });            

            if(direccion){

                const { codigoPostal = null, colonia = null, calle = null, numeroExterior = null, numeroInterior = null, estado = null, ciudad = null } = direccion;  

                if (usuario.direccion) {
                    await usuario.direccion.update({ codigoPostal, colonia, calle, numeroExterior, numeroInterior, estado, ciudad });
                } else {
                    await usuario.createDireccion({ codigoPostal, colonia, calle, numeroExterior, numeroInterior, estado, ciudad });
                }
            }

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

            const result = await uploadFiles(galeria, 'profile-picture' );

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