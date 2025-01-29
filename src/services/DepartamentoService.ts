import { WhereOptions } from "sequelize"
import { Departamentos } from "../models"

interface Props {
    departamentosArray?: string[]
}

export const getDepartamentosService = async ({departamentosArray}: Props) => {

     let where: WhereOptions = {}

    if(departamentosArray) {
        where = {
            id: departamentosArray
        }
    }


    return await Departamentos.findAll({
        attributes: ['id', 'nombre', 'slug', 'status', 'codigo', 'color'],
        order: [
            ['nombre', 'ASC']
        ],
        where
    })
}