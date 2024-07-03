import { Usuarios } from './Usuarios';
import { Rendimiento } from './Rendimiento';
import { Areas } from './Areas';
import { Direccion } from './Direccion';
import { Departamentos } from './Departamentos';
import { Perspectivas } from './Perspectivas';
import { ObjetivoEstrategico } from './Estrategicos';
import { Tacticos } from './Tacticos';
import { ObjetivoOperativos } from './Operativos';
import { Tareas } from './Tareas';
import { ResultadosClave } from './ResultadoClave';
import { Proyectos } from './Proyectos';
import { Hitos } from './Hitos';
import { Roles } from './Roles';
import { GaleriaDevarana } from './custom/GaleriaDevarana';
import { CategoriaPreguntas } from './evaluacion/CategoriaPreguntas';

// Pivot tables
import { PivotPerspEstr } from './pivot/PivotPerspectivaEstrategia';
import { PivotObjetivoRendimiento } from './pivot/PivotObjetivoRendimiento';
import { PivotRespTact } from './pivot/PivotResponsablesTactico';
import { PivotEstrResp } from './pivot/PivotEstrategiaResponsables';
import { PivotOpUsuario } from './pivot/PivotOperativoUsuario';
import { PivotTareasResponsables } from './pivot/PivotTareasResponsables';
import { PivotProyectoUsuarios } from './pivot/PivotProyectoUsuarios';
import { Comentarios } from './Comentarios';
import { Permisos } from './Permisos';


import UsuarioHitosOrden from './custom/UsuarioHitosOrden';
import GaleriaUsuarios from './custom/GaleriaUsuarios';
// import PivotObjetivoTacticoTrimestre from './pivot/PivotTacticoTrimestre';
import ConfiguracionUsuario from './custom/ConfiguracionUsuario';
// import Trimestre from './custom/Trimestre';


import { Evaluacion, AsignacionPreguntaEvaluacion, AsignacionEvaluacion, EvaluacionPregunta, EvaluacionRespuesta } from './evaluacion'
import { HistorialPerformance } from './HistorialPerformance';
import { Task } from './Task';
import { Creditos } from './Creditos';





// Usuarios

Usuarios.hasMany(Usuarios, { as: 'subordinados', foreignKey: 'leaderId' });
Usuarios.belongsTo(Usuarios, { as: 'lider', foreignKey: 'leaderId' });

Usuarios.belongsTo(Departamentos, { as: 'departamento', foreignKey: 'departamentoId' });
Usuarios.belongsTo(Direccion, { as: 'direccion', foreignKey: 'direccionId', onDelete: 'SET NULL' });
Usuarios.belongsToMany(Proyectos, { through: PivotProyectoUsuarios, as: 'proyectos', foreignKey: 'usuarioId' });

Usuarios.belongsToMany(Hitos, { through: UsuarioHitosOrden, as: 'ordenHito', foreignKey: 'usuarioId' })
Usuarios.hasMany(GaleriaUsuarios, { as: 'galeria', foreignKey: 'usuarioId' });
Usuarios.hasOne(ConfiguracionUsuario, { as: 'configuracion', foreignKey: 'usuarioId' });
Usuarios.belongsTo(Roles, { as: 'rol', foreignKey: 'rolId' });

Usuarios.hasOne(Creditos, { as: 'creditos', foreignKey: 'usuarioId' });

// Áreas
Areas.hasMany(Areas, { as: 'subAreas', foreignKey: 'parentId' });
Areas.hasMany(Departamentos, { as: 'departamentos', foreignKey: 'areaId' });
Areas.belongsTo(Usuarios, { as: 'leader', foreignKey: 'leaderId' });
Areas.hasOne(Perspectivas, { as: 'perspectivas', foreignKey: 'areaId' });


// Departamentos
Departamentos.belongsTo(Areas, { as: 'area', foreignKey: 'areaId' });
Departamentos.hasMany(Usuarios, { as: 'usuario', foreignKey: 'departamentoId' });
Departamentos.belongsTo(Usuarios, { as: 'leader', foreignKey: 'leaderId' });

// Perspectivas
Perspectivas.hasMany(ObjetivoEstrategico, { as: 'objetivosEstrategicos', foreignKey: 'perspectivaId' });
Perspectivas.belongsTo(Areas, { as: 'area', foreignKey: 'areaId' });

// Objetivo Estrategico
ObjetivoEstrategico.belongsTo(Usuarios, { as: 'propietario', foreignKey: 'propietarioId' });
ObjetivoEstrategico.hasMany(Tacticos, { as: 'tacticos', foreignKey: 'estrategicoId' });
ObjetivoEstrategico.belongsTo(Perspectivas, { as: 'perspectivas', foreignKey: 'perspectivaId' });
ObjetivoEstrategico.hasMany(Comentarios, { as: 'comentarios', foreignKey: 'comentableId', constraints: false,
    scope: {
        comentableType: 'ESTRATEGICO',
    }
});


// Tacticos
Tacticos.belongsTo(ObjetivoEstrategico, { as: 'estrategico', foreignKey: 'estrategicoId' });
Tacticos.belongsTo(Usuarios, { as: 'propietario', foreignKey: 'propietarioId' });
Tacticos.hasMany(Comentarios, { as: 'comentarios', foreignKey: 'comentableId', constraints: false,
    scope: {
        comentableType: 'TACTICO',
    }
});

// Core.belongsTo(Usuarios, { as: 'propietario', foreignKey: 'propietarioId' });
// Core.hasMany(Comentarios, { as: 'comentarios', foreignKey: 'comentableId', constraints: false,
//     scope: {
//         comentableType: 'CORE',
//     }
// });

// Objetivo Operativo
ObjetivoOperativos.belongsTo(Tacticos, { as: 'tacticoOperativo', foreignKey: 'tacticoId', onDelete: 'SET NULL' });
ObjetivoOperativos.hasMany(ResultadosClave, { as: 'resultadosClave', foreignKey: 'operativoId' });

// Resultados Clave
ResultadosClave.belongsTo(ObjetivoOperativos, { as: 'operativo', foreignKey: 'operativoId' });
ResultadosClave.belongsTo(Usuarios, { as: 'propietario', foreignKey: 'propietarioId' });
// ResultadosClave.hasMany(Acciones, { as: 'acciones', foreignKey: 'resultadoClaveId' });

// Proyectos
Proyectos.hasMany(Hitos, { as: 'proyectosHito', foreignKey: 'proyectoId', onDelete: 'CASCADE' });
Proyectos.belongsTo(Usuarios, { as: 'propietario', foreignKey: 'propietarioId' });
Proyectos.belongsToMany(Usuarios, { through: PivotProyectoUsuarios, as: 'usuariosProyecto', foreignKey: 'proyectoId' });


// Hitos
Hitos.belongsTo(Proyectos, { as: 'hitosProyecto', foreignKey: 'proyectoId', onDelete: 'CASCADE' });
// Hitos.hasMany(Tareas, { as: 'tareas', foreignKey: 'hitoId' });
Hitos.belongsToMany(Usuarios, { through: UsuarioHitosOrden, as: 'ordenHito', foreignKey: 'hitoId' })

// // Tareas 
// Tareas.belongsTo(Usuarios, { as: 'propietario', foreignKey: 'propietarioId' });
// Tareas.belongsTo(Hitos, { as: 'tareas', foreignKey: 'hitoId' });


Comentarios.belongsTo(Usuarios, { as: 'autor', foreignKey: 'autorId' });
Comentarios.belongsTo(ObjetivoEstrategico, { as: 'objetivoEstrategico', foreignKey: 'comentableId', constraints: false, scope: { comentableType: 'estrategico' } });


//* ----------------- Pivot tables -----------------

// Objetivo Estratégico - Usuarios
ObjetivoEstrategico.belongsToMany(Usuarios, { as: 'responsables', through: PivotEstrResp, onDelete: 'CASCADE', foreignKey: 'objEstrategicoId' });

// Perspectivas - Objetivo Estratégico
Perspectivas.belongsToMany(ObjetivoEstrategico, { as: 'objetivoEstrategico',  through: PivotPerspEstr, onDelete: 'CASCADE', foreignKey: 'perspectivaId' });


// Tacticos, Core - Usuarios
Tacticos.belongsToMany(Usuarios, { as: 'responsables', through: PivotRespTact, onDelete: 'CASCADE', foreignKey: 'tacticoId' });
// Core.belongsToMany(Usuarios, { as: 'responsables', through: PivotRespTact, onDelete: 'CASCADE', foreignKey: 'tacticoId' });

// Tacticos, Core - Departamentos
Tacticos.belongsTo(Departamentos, { as: 'departamentos', onDelete: 'CASCADE', foreignKey: 'departamentoId' });
// Core.belongsTo(Departamentos, { as: 'departamentos', onDelete: 'CASCADE', foreignKey: 'departamentoId' });

// Áreas - Tacticos
Departamentos.hasMany(Tacticos, { as: 'tacticos',  onDelete: 'CASCADE', foreignKey: 'departamentoId' });
// Departamentos.hasMany(Core, { as: 'core',  onDelete: 'CASCADE', foreignKey: 'departamentoId' });

// Usuarios - Tacticos
Usuarios.belongsToMany(Tacticos, { as: 'tacticos', through: PivotRespTact, onDelete: 'CASCADE', foreignKey: 'responsableId' });
// Usuarios.belongsToMany(Core, { as: 'core', through: PivotRespTact, onDelete: 'CASCADE', foreignKey: 'responsableId' });

// Usuarios - Objetivo Estratégico
Usuarios.belongsToMany(ObjetivoEstrategico, { as: 'objetivoEstrategico', through: PivotEstrResp, onDelete: 'CASCADE', foreignKey: 'responsableId' });

ObjetivoOperativos.belongsToMany(Usuarios, { as: 'operativosResponsable', through: PivotOpUsuario, onDelete: 'CASCADE', foreignKey: 'objetivoOperativoId' });
Usuarios.belongsToMany(ObjetivoOperativos, { as: 'objetivosOperativos', through: PivotOpUsuario, onDelete: 'CASCADE', foreignKey: 'usuarioId' });


// Tareas.belongsToMany(Usuarios, { as: 'usuariosTarea', through: PivotTareasResponsables, onDelete: 'CASCADE', foreignKey: 'tareaId', });
// Usuarios.belongsToMany(Tareas, { as: 'tareas', through: PivotTareasResponsables, onDelete: 'CASCADE', foreignKey: 'responsableId' });


Roles.belongsToMany(Permisos, { through: 'pivot_permisos_roles', as: 'permisos', foreignKey: 'rolId' });
Permisos.belongsToMany(Roles, { through: 'pivot_permisos_roles', as: 'roles', foreignKey: 'permisoId' });



CategoriaPreguntas.hasMany(EvaluacionPregunta, { as: 'preguntas', foreignKey: 'categoriaPreguntaId' });
EvaluacionPregunta.belongsTo(CategoriaPreguntas, { as: 'categoria', foreignKey: 'categoriaPreguntaId' });

Evaluacion.belongsToMany(EvaluacionPregunta, { through: {model: AsignacionPreguntaEvaluacion, unique: false}, foreignKey: 'evaluacionId', otherKey:'preguntaId', as: 'preguntasEvaluacion', });
EvaluacionPregunta.belongsToMany(Evaluacion, { through: {model: AsignacionPreguntaEvaluacion, unique: false}, foreignKey: 'preguntaId', otherKey:'evaluacionId', as: 'evaluacionesPregunta' });



EvaluacionRespuesta.belongsTo(Evaluacion, { foreignKey: 'evaluacionId' });
Evaluacion.hasMany(EvaluacionRespuesta, { foreignKey: 'evaluacionId' });

EvaluacionRespuesta.belongsTo(EvaluacionPregunta, { foreignKey: 'evaluacionPreguntaId' });
EvaluacionPregunta.hasMany(EvaluacionRespuesta, { foreignKey: 'evaluacionPreguntaId' });


AsignacionEvaluacion.belongsTo(Evaluacion)
AsignacionEvaluacion.belongsTo(Usuarios, { as: 'evaluador', foreignKey: 'evaluadorId' })
AsignacionEvaluacion.belongsTo(Usuarios, { as: 'evaluado', foreignKey: 'evaluadoId' })
Evaluacion.hasMany(AsignacionEvaluacion)

AsignacionEvaluacion.hasMany(EvaluacionRespuesta, { foreignKey: 'evaluacionUsuarioId' })
EvaluacionRespuesta.belongsTo(AsignacionEvaluacion, { foreignKey: 'evaluacionUsuarioId' })


Usuarios.hasMany(AsignacionEvaluacion, { as: 'evaluacionesEvaluado', foreignKey: 'evaluadoId' })
Usuarios.hasMany(AsignacionEvaluacion, { as: 'evaluacionesEvaluador', foreignKey: 'evaluadorId' })


Usuarios.hasMany(HistorialPerformance, { as: 'historialPerformance', foreignKey: 'usuarioId' })
HistorialPerformance.belongsTo(Usuarios, { as: 'usuario', foreignKey: 'usuarioId' })


ResultadosClave.hasMany(Task, { as: 'task', foreignKey: 'taskeableId', constraints: false,
    scope: {
        taskeableType: 'RESULTADO_CLAVE',
    }
});

Hitos.hasMany(Task, { as: 'task', foreignKey: 'taskeableId', constraints: false,
    scope: {
        taskeableType: 'HITO',
    }
});


Task.belongsTo(Usuarios, { as: 'propietario', foreignKey: 'propietarioId' });

Task.belongsTo(ResultadosClave, { as: 'taskResultadoClave', foreignKey: 'taskeableId', constraints: false,
    scope: {
        taskeableType: 'RESULTADO_CLAVE',
    }
});

Task.belongsTo(Hitos, { as: 'taskHito', foreignKey: 'taskeableId', constraints: false,
    scope: {
        taskeableType: 'HITO',
    }
});

Usuarios.hasMany(Rendimiento, { as: 'rendimiento', foreignKey: 'usuarioId' });

// Objetivo Operativo
ObjetivoOperativos.belongsToMany(Rendimiento, {
    as: 'operativoRendimiento', 
    through: {
        model: PivotObjetivoRendimiento, 
        unique: false
    }, 
    onDelete: 'CASCADE',
    foreignKey: 'objOperativoId'
});
Rendimiento.belongsToMany(ObjetivoOperativos, { 
    as: 'rendimientoOperativo', 
    through: {
        model: PivotObjetivoRendimiento, 
        unique: false
    }, 
    onDelete: 'CASCADE', 
    foreignKey: 'rendimientoId'
});

export {
    Usuarios,
    Areas,
    Direccion,
    Departamentos,
    Perspectivas,
    ObjetivoEstrategico,
    Tacticos,
    ObjetivoOperativos,
    ResultadosClave,
    Creditos,

    Tareas,
    Proyectos,
    Hitos,
    Comentarios,
    Roles,
    Permisos,
    // Trimestre,
    Rendimiento,
    Task,
    // Core,

    PivotTareasResponsables,
    PivotPerspEstr,
    PivotRespTact,

    PivotEstrResp,
    PivotOpUsuario,
    PivotProyectoUsuarios,
    // PivotObjetivoTacticoTrimestre,


    UsuarioHitosOrden,
    GaleriaUsuarios,
    GaleriaDevarana,
    ConfiguracionUsuario,

    Evaluacion,
    AsignacionEvaluacion,
    AsignacionPreguntaEvaluacion,
    EvaluacionPregunta,
    EvaluacionRespuesta,


}



