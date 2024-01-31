import { Router } from 'express';
import { check } from 'express-validator';
import { asignarPreguntasEvaluacion, obtenerEvaluadores, obtenerEvaluacion, obtenerUsuariosAEvaluar, guardarEvaluacion, obtenerResultadoEvaluacion, asignarEvaluadoresEmpresa, obtenerResultadoEvaluacionLider, obtenerRespuestasEvaluacion, 
    
    getEvaluaciones, createAsignacionEvaluacion, deleteAsignacionEvaluacion, getEvaluacion, asignarEvaluaciones, 
    getEvaluacionResultadosCategoria,
    getCategoriasResultados
} from '../../controllers/EvaluacionController';
import { validarCampos } from '../../middleware/validateFields';

const router = Router();

// API url: /evaluacion 

//TODO: cambiar la url de competencias a evaluacion cuando se ajusten los demás servicios

router.put('/preguntas', asignarPreguntasEvaluacion);
router.post('/asignar', asignarEvaluadoresEmpresa);
router.get('/evaluadores/:id', obtenerEvaluadores);
router.get('/usuarios/:id', obtenerUsuariosAEvaluar);
router.post('/respuestas', guardarEvaluacion);
router.get('/resultados/:id', obtenerResultadoEvaluacion)
router.get('/resultados/lider/:id', obtenerResultadoEvaluacionLider)
router.get('/respuestas/:id', obtenerRespuestasEvaluacion)



router.get('/competencias', getEvaluaciones)
router.post('/competencias', createAsignacionEvaluacion)
router.delete('/competencias', deleteAsignacionEvaluacion)
router.post('/competencias/generate', asignarEvaluadoresEmpresa);

router.get('/competencias/resultados', [
    check('year', 'El año es obligatorio').not().isEmpty(),
    check('quarter', 'El trimestre es obligatorio').not().isEmpty(),
    check('usuarioId', 'El usuario es obligatorio').not().isEmpty(),
    check('categoriaId', 'La categoria es obligatoria').not().isEmpty(),
    validarCampos,
], getEvaluacionResultadosCategoria)

router.get('/competencias/categorias', [
    check('year', 'El año es obligatorio').not().isEmpty(),
    check('quarter', 'El trimestre es obligatorio').not().isEmpty(),
    check('usuarioId', 'El usuario es obligatorio').not().isEmpty(),
    validarCampos,
], getCategoriasResultados)

router.get('/competencias/:id', getEvaluacion)




router.get('/:id', obtenerEvaluacion)

export default router;