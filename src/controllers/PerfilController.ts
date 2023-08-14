import { Request, Response } from "express";
import { ConfiguracionUsuario, Departamentos, Direccion, GaleriaUsuarios, ObjetivoOperativos, Proyectos, ResultadosClave, Usuarios } from "../models";
import { Op } from "sequelize";


const perfilInclude = [
    { model: Departamentos, as: 'departamento', include: ['area']}, 
    { model: Direccion, as: 'direccion' },
    { 
        model: ObjetivoOperativos, as: 'responsableOperativos', 
        include: [
            { model: ResultadosClave, as:'resultadosClave' },
            { model: Usuarios, as: 'operativosResponsable' }
        ] 
    },
    { model: Proyectos, as: 'proyectos', through: { attributes: [] } },
    { model: GaleriaUsuarios, as: 'galeria'},
    { model: ConfiguracionUsuario, as: 'configuracion'},
]

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
