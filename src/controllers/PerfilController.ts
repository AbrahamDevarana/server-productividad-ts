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
    console.log('getPerfil');
    

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

export const getEquipo = async (req: Request, res: Response) => {

    const {id} = req.params;

    const usuario = await Usuarios.findOne({
        where: { id },
    })

    if (!usuario) return res.status(404).json({ ok: false, msg: 'Usuario no encontrado' })

    const lider = await usuario.getLider({
        attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'slug', 'iniciales', 'foto']
    })
    const subordinados = await usuario.getSubordinados({
        attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'slug', 'iniciales', 'foto']
    })

    const equipo = [lider, usuario, ...subordinados]
    

    res.json({
        ok: true,
        equipo
    })
}

export const getColaboradores = async (req: Request, res: Response) => {


    const {id} = req.params;

    const { year, quarter} = req.query;
    

        try{
            const usuario = await Usuarios.findByPk(id, {})
            if (!usuario) return res.status(404).json({ ok: false, msg: 'Usuario no encontrado' })

            const objetivos = await usuario.getObjetivosOperativos({
                where: {
                    year,
                    quarter
                },
                include: [
                    {
                        association: 'operativosResponsable',
                        attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'slug', 'iniciales', 'foto'],
                        through: {
                            attributes: ['propietario', 'progresoAsignado', 'progresoReal'],
                            as: 'scoreCard'
                        }
                    },
                ]
            })

        
            const colaboradores = objetivos.map((objetivo: any) => objetivo.operativosResponsable).flat().filter((operativo: any) => operativo.id !== usuario.id)
            const colaboradoresUnicos = Array.from(new Set(colaboradores.map((colaborador:any) => colaborador.id))).map(id => {
                return colaboradores.find((colaborador:any) => colaborador.id === id);
            });
            

            return res.json({
                ok: true,
                colaboradores: colaboradoresUnicos
            })


        } catch (error) {
            console.log(error)
            return res.status(500).json({
                ok: false,
                msg: 'Error inesperado'
            })
        }
    
}

