import { Rendimiento } from "../models";

export const updateRendimientoService = async ({usuarioId, year, quarter} : {usuarioId: string, year: number, quarter: number}) => {
    const rendimiento = await Rendimiento.findOne({
        where: {
            usuarioId,
            year,
            quarter
        }
    });

    if(rendimiento){
        return await rendimiento.update({
            status: 'CERRADO'
        });   
    }

    return true 
}