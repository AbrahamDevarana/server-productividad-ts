import { Request, Response } from "express";
import { GestionObjetivos } from "../models/GestionObjetivos";
import dayjs from "dayjs";


export const getOrCreateGestionObjetivos = async (req: Request, res: Response) => {

    
    const { year, quarter} = req.query as any;

    if (!year || !quarter) {
        res.status(400).json({ msg: 'Los parametros year y quarter son requeridos' });
        return;
    }
    
    try {        
        const [gestionObjetivo, created] = await GestionObjetivos.findOrCreate({
            where: { year, quarter },
            defaults: {
                year,
                quarter,
            }
        })

    

        if(created) {
            const quarterDate = dayjs().year(year).quarter(quarter);

            const initQuarter = quarterDate.quarter(quarter).startOf('quarter');
            

            gestionObjetivo.periodoDefinicionInicio = initQuarter.subtract(10, 'day').toDate();
            gestionObjetivo.periodoDefinicionFin = initQuarter.add(10, 'day').toDate();
            // ejecucionInicio y fin todo el periodo del quarter
            gestionObjetivo.ejecucionInicio = initQuarter.startOf('quarter').toDate();
            gestionObjetivo.ejecucionFin = initQuarter.endOf('quarter').toDate();
            // revisionIntermediaInicio y fin son 10 días a mitad de quarter
            gestionObjetivo.revisionIntermediaInicio = initQuarter.add(10, 'day').toDate();
            gestionObjetivo.revisionIntermediaFin = initQuarter.add(45, 'day').toDate();
            // cierreObjetivosInicio y fin son 10 días antes y despues de finalizar el quarter
            gestionObjetivo.cierreObjetivosInicio = initQuarter.add(75, 'day').toDate();
            gestionObjetivo.cierreObjetivosFin = initQuarter.add(105, 'day').toDate();
            // cierreEvaluacionCompetenciasInicio y fin son 5 días antes y t 10 despues de finalizar el quarter
            gestionObjetivo.cierreEvaluacionCompetenciasInicio = initQuarter.add(110, 'day').toDate();
            gestionObjetivo.cierreEvaluacionCompetenciasFin = initQuarter.add(130, 'day').toDate();
            await gestionObjetivo.save();
        }

        res.status(200).json({gestionObjetivo})

    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
}

export const updateGestionObjetivos = async (req: Request, res: Response) => {

    
    
    const { id } = req.params;
    const { year, quarter, periodoDefinicionInicio, periodoDefinicionFin, ejecucionInicio, ejecucionFin, revisionIntermediaInicio, revisionIntermediaFin, cierreObjetivosInicio, cierreObjetivosFin, cierreEvaluacionCompetenciasInicio, cierreEvaluacionCompetenciasFin } = req.body;

    console.log(periodoDefinicionInicio, periodoDefinicionFin, ejecucionInicio, ejecucionFin, revisionIntermediaInicio, revisionIntermediaFin, cierreObjetivosInicio, cierreObjetivosFin, cierreEvaluacionCompetenciasInicio, cierreEvaluacionCompetenciasFin);
    
    
    console.log(req.params);
    if (!year || !quarter) {
        res.status(400).json({ msg: 'Los parametros year y quarter son requeridos' });
        return;
    }

    try {
        const gestionObjetivo = await GestionObjetivos.findByPk(id);

        if (!gestionObjetivo) {
            res.status(404).json({ msg: 'No se encontro la gestion de objetivos' });
            return;
        }

        gestionObjetivo.update({
            year,
            quarter,
            periodoDefinicionInicio: dayjs(periodoDefinicionInicio).toDate(),
            periodoDefinicionFin: dayjs(periodoDefinicionFin).toDate(),
            ejecucionInicio: dayjs(ejecucionInicio).toDate(),
            ejecucionFin: dayjs(ejecucionFin).toDate(),
            revisionIntermediaInicio: dayjs(revisionIntermediaInicio).toDate(),
            revisionIntermediaFin: dayjs(revisionIntermediaFin).toDate(),
            cierreObjetivosInicio: dayjs(cierreObjetivosInicio).toDate(),
            cierreObjetivosFin: dayjs(cierreObjetivosFin).toDate(),
            cierreEvaluacionCompetenciasInicio: dayjs(cierreEvaluacionCompetenciasInicio).toDate(),
            cierreEvaluacionCompetenciasFin: dayjs(cierreEvaluacionCompetenciasFin).toDate(),
        })

        console.log(gestionObjetivo);
        

        res.status(200).json({ gestionObjetivo })

    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
}