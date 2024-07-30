import { Router } from "express";
import { getCategoriasProyecto, getCategoriaProyecto, createCategoriaProyecto, updateCategoriaProyecto, addProyectoToCategoria, deleteCategoriaProyecto} from "../../controllers/CategoriaProyectosController";

const router = Router();


router.get('/', getCategoriasProyecto);
router.get('/:id', getCategoriaProyecto);
router.post('/', createCategoriaProyecto);
router.put('/:id', updateCategoriaProyecto);
router.delete('/:id', deleteCategoriaProyecto);
router.post('/proyectos', addProyectoToCategoria);


export default router;