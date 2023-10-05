import { Rendimiento, Usuarios } from "../models";


export const generateRendimientos = async () => {

    const usuarios = await Usuarios.findAll({});

    const year = 2023
    const quarters = [1,2];

    

    const rendimientoData = usuarios.map((usuario: any) => {
        return quarters.map((quarter: any) => {
            return {
                year, // Ensure year is defined and has a valid value
                quarter, // Ensure quarter is defined and has a valid value
                usuarioId: usuario.id,
                resultadoObjetivos: 0,
                resultadoCompetencias: 0,
                resultadoFinal: 0,
                extra: '',
                status: 'CERRADO'
            };
        });
    });

    // Flatten the rendimientoData array    
    const flattenedRendimientoData = rendimientoData.reduce((acc: any, val: any) => acc.concat(val), []);

// Now use bulkCreate with the flattenedRendimientoData array
    await Rendimiento.bulkCreate(flattenedRendimientoData);




}