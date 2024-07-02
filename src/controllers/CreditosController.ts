import { Request, Response } from 'express';
import { Usuarios, Creditos } from '../models';

export const getCreditos = async (req: Request, res: Response) => {
    try {
       const usuarios = await Usuarios.findAll({
              include: ['creditos']
        });
        return res.status(200).json(usuarios);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const getCreditosByUserId = async (req: Request, res: Response) => {
    const { userId } = req.params;
    try {
        const creditos = await Creditos.findOne({
            where: { usuarioId: userId }
        });
        return res.status(200).json(creditos);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const updateCreditos = async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { saldo } = req.body;
    try {
        const creditos = await Creditos.findOne({
            where: { usuarioId: userId }
        });
        if (creditos) {
            await creditos.update({ saldo });
            return res.status(200).json(creditos);
        } else {
            return res.status(404).json({ message: 'Creditos not found' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const renovateCreditos = async (req: Request, res: Response) => {
    const { userId, amount } = req.body;
    try {
        const creditos = await Creditos.findOne({
            where: { usuarioId: userId }
        });
        
        if (creditos) {
            await creditos.update({ saldo: amount });
            return res.status(200).json(creditos);
        } else {
            return res.status(404).json({ message: 'Creditos not found' });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}