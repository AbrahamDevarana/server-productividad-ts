import { Router } from "express";

import usuarioRoutes from "./api/usuariosRoutes";

const router = Router();


router.use('/usuarios', usuarioRoutes)










export default router;