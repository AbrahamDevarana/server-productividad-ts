import { NextFunction, Request, Response } from "express"

const isUserAuthenticated = async (req: Request, res: Response, next: NextFunction) => {       
    if(req.user){
        next()
    }else{
        res.status(401).json({ message: 'Error al iniciar sesión'})
    }
}

export default isUserAuthenticated