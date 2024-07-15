import {Router} from 'express';
import jwt from 'jsonwebtoken';
require('dotenv').config();
import { Request, Response } from "express";


const router = Router();

router.get('/tiptap', ( req: Request, res: Response ) => {

    const payload = {}

    const tiptap = jwt.sign(payload, process.env.TIP_TAP_APP_SECRET as string, {
        expiresIn: '7d'
    })

    res.status(200).json({ tiptap })
})


export default router;