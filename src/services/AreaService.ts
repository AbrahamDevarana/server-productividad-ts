import { WhereOptions } from "sequelize"
import { Areas } from "../models"
import { AreaInterface } from "../interfaces"
import { AreaInstance } from "../models/Areas"

interface Props {
    areasIds?: number | number[]
    liderId?: string
    areaId: number
}

export const getAreasService = async ({areasIds}: Props) => {

    let where: WhereOptions = {}

    if(areasIds) {
        where = {
            id: areasIds
        }
    }

    const areas = await Areas.findAll({
        attributes: ['id', 'nombre', 'slug', 'status', 'codigo', 'leaderId'],
        order: [
            ['nombre', 'ASC']
        ],
        where
    })

    return areas;
}

export const getFirstAreaService = async ({areaId}: Props) : Promise<AreaInstance> => {
    
    const area = await Areas.findOne({
        attributes: ['id', 'nombre', 'slug', 'status', 'codigo', 'leaderId'],
        where: {
            id: areaId
        }
    })

    if(!area) {
        throw new Error('No se encontró el área')
    }

    return area;
}

export const getAreaLiderService = async ({liderId}: Props) : Promise<AreaInstance[]> => {

    let where: WhereOptions = {}

    if(liderId) {
        where = {
            liderId
        }
    }

    const areas = await Areas.findAll({
        attributes: ['id', 'nombre', 'slug', 'status', 'codigo'],
        order: [
            ['nombre', 'ASC']
        ],
        where
    })

    return areas;
}