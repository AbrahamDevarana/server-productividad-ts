import { PivotEvaluacionUsuario } from './pivot/PivotEvaluacionUsuario';
import { Usuarios } from './Usuarios';
import { Rendimiento } from './Rendimiento';
import { Areas } from './Areas';
import { Direccion } from './Direccion';
import { Departamentos } from './Departamentos';
import { Perspectivas } from './Perspectivas';
import { ObjetivoEstrategico } from './Estrategicos';
import { Tacticos } from './Tacticos';
import { ObjetivoOperativos } from './Operativos';
import { Acciones } from './Acciones';
import { Tareas } from './Tareas';
import { ResultadosClave } from './ResultadoClave';
import { Proyectos } from './Proyectos';
import { Hitos } from './Hitos';
import { Roles } from './Roles';
import { GaleriaDevarana } from './custom/GaleriaDevarana';
import { Evaluacion } from './Evaluacion';
import { EvaluacionPreguntas } from './EvaluacionPreguntas';



// Pivot tables
import { PivotPerspEstr } from './pivot/PivotPerspectivaEstrategia';
import { PivotRespTact } from './pivot/PivotResponsablesTactico';
import { PivotAreaTactico } from './pivot/PivotAreaTactico';
import { PivotEstrResp } from './pivot/PivotEstrategiaResponsables';
import { PivotOpUsuario } from './pivot/PivotOperativoUsuario';
import { PivotTareasResponsables } from './pivot/PivotTareasResponsables';
import { PivotProyectoUsuarios } from './pivot/PivotProyectoUsuarios';
import { Comentarios } from './Comentarios';
import { Permisos } from './Permisos';

import { EvaluacionRespuesta } from './EvaluacionRespuesta';

import UsuarioHitosOrden from './custom/UsuarioHitosOrden';
import GaleriaUsuarios from './custom/GaleriaUsuarios';
import PivotObjetivoTacticoTrimestre from './pivot/PivotTacticoTrimestre';
import ConfiguracionUsuario from './custom/ConfiguracionUsuario';
import Trimestre from './custom/Trimestre';
import { TipoEvaluacion } from './TipoEvaluacion';





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
Tacticos.belongsTo(Usuarios, { as: 'propietario', foreignKey: 'propietarioId' });
Tacticos.belongsTo(ObjetivoEstrategico, { as: 'estrategico', foreignKey: 'estrategicoId' });
Tacticos.hasMany(Comentarios, { as: 'comentarios', foreignKey: 'comentableId', constraints: false,
    scope: {
        comentableType: 'TACTICO',
    }
});

Tacticos.belongsToMany(Trimestre, { through: PivotObjetivoTacticoTrimestre, as: 'trimestres'} );
Trimestre.belongsToMany(Tacticos, { through: PivotObjetivoTacticoTrimestre, as: 'tacticos'} );

// Objetivo Operativo
ObjetivoOperativos.belongsTo(Tacticos, { as: 'tacticoOperativo', foreignKey: 'tacticoId', onDelete: 'SET NULL' });
ObjetivoOperativos.hasMany(ResultadosClave, { as: 'resultadosClave', foreignKey: 'operativoId' });

// Resultados Clave
ResultadosClave.belongsTo(ObjetivoOperativos, { as: 'operativo', foreignKey: 'operativoId' });
ResultadosClave.belongsTo(Usuarios, { as: 'propietario', foreignKey: 'propietarioId' });
ResultadosClave.hasMany(Acciones, { as: 'acciones', foreignKey: 'resultadoClaveId' });

// Proyectos
Proyectos.hasMany(Hitos, { as: 'proyectosHito', foreignKey: 'proyectoId', onDelete: 'CASCADE' });
Proyectos.belongsTo(Usuarios, { as: 'propietario', foreignKey: 'propietarioId' });
Proyectos.belongsToMany(Usuarios, { through: PivotProyectoUsuarios, as: 'usuariosProyecto', foreignKey: 'proyectoId' });


// Hitos
Hitos.belongsTo(Proyectos, { as: 'hitosProyecto', foreignKey: 'proyectoId', onDelete: 'CASCADE' });
Hitos.hasMany(Tareas, { as: 'tareas', foreignKey: 'hitoId' });
Hitos.belongsToMany(Usuarios, { through: UsuarioHitosOrden, as: 'ordenHito', foreignKey: 'hitoId' })

// Tareas 
Tareas.belongsTo(Usuarios, { as: 'propietario', foreignKey: 'propietarioId' });
Tareas.belongsTo(Hitos, { as: 'tareas', foreignKey: 'hitoId' });


Comentarios.belongsTo(Usuarios, { as: 'autor', foreignKey: 'autorId' });
Comentarios.belongsTo(ObjetivoEstrategico, { as: 'objetivoEstrategico', foreignKey: 'comentableId', constraints: false, scope: { comentableType: 'estrategico' } });


//* ----------------- Pivot tables -----------------

// Objetivo Estratégico - Usuarios
ObjetivoEstrategico.belongsToMany(Usuarios, { as: 'responsables', through: PivotEstrResp, onDelete: 'CASCADE', foreignKey: 'objEstrategicoId' });

// Perspectivas - Objetivo Estratégico
Perspectivas.belongsToMany(ObjetivoEstrategico, { as: 'objetivoEstrategico',  through: PivotPerspEstr, onDelete: 'CASCADE', foreignKey: 'perspectivaId' });


// Tacticos - Usuarios
Tacticos.belongsToMany(Usuarios, { as: 'responsables', through: PivotRespTact, onDelete: 'CASCADE', foreignKey: 'tacticoId' });

// Tacticos - Áreas
Tacticos.belongsToMany(Areas, { as: 'areas', through: PivotAreaTactico, onDelete: 'CASCADE', foreignKey: 'tacticoId' });

// Áreas - Tacticos
Areas.belongsToMany(Tacticos, { as: 'tacticos', through: PivotAreaTactico, onDelete: 'CASCADE', foreignKey: 'areaId' });

// Usuarios - Tacticos
Usuarios.belongsToMany(Tacticos, { as: 'tacticos', through: PivotRespTact, onDelete: 'CASCADE', foreignKey: 'responsableId' });

// Usuarios - Objetivo Estratégico
Usuarios.belongsToMany(ObjetivoEstrategico, { as: 'objetivoEstrategico', through: PivotEstrResp, onDelete: 'CASCADE', foreignKey: 'responsableId' });

// Objetivo Operativo
ObjetivoOperativos.belongsToMany(Rendimiento, { as: 'operativoRendimiento', through: 'pivot_objetivo_rendimiento', onDelete: 'CASCADE', foreignKey: 'objetivoOperativoId', otherKey: 'rendimientoId', uniqueKey: 'unique_operativo_rendimiento' });
Rendimiento.belongsToMany(ObjetivoOperativos, { as: 'rendimientoOperativo', through: 'pivot_objetivo_rendimiento', onDelete: 'CASCADE', foreignKey: 'rendimientoId', otherKey: 'objetivoOperativoId', uniqueKey: 'unique_rendimiento_operativo' });

ObjetivoOperativos.belongsToMany(Usuarios, { as: 'operativosResponsable', through: PivotOpUsuario, onDelete: 'CASCADE', foreignKey: 'objetivoOperativoId' });
Usuarios.belongsToMany(ObjetivoOperativos, { as: 'responsableOperativos', through: PivotOpUsuario, onDelete: 'CASCADE', foreignKey: 'usuarioId' });


Tareas.belongsToMany(Usuarios, { as: 'usuariosTarea', through: PivotTareasResponsables, onDelete: 'CASCADE', foreignKey: 'tareaId', });
Usuarios.belongsToMany(Tareas, { as: 'tareas', through: PivotTareasResponsables, onDelete: 'CASCADE', foreignKey: 'responsableId' });


Roles.belongsToMany(Permisos, { through: 'pivot_permisos_roles', as: 'permisos', foreignKey: 'rolId' });
Permisos.belongsToMany(Roles, { through: 'pivot_permisos_roles', as: 'roles', foreignKey: 'permisoId' });


// Evaluación

TipoEvaluacion.hasMany(Evaluacion, { as: 'evaluaciones', foreignKey: 'tipoEvaluacionId' });
Evaluacion.belongsTo(TipoEvaluacion, { as: 'tipoEvaluacion', foreignKey: 'tipoEvaluacionId' });

Evaluacion.belongsToMany(EvaluacionPreguntas, { through: 'pivot_evaluacion_preguntas', as: 'preguntas', foreignKey: 'evaluacionId' });
EvaluacionPreguntas.belongsToMany(Evaluacion, { through: 'pivot_evaluacion_preguntas', as: 'evaluaciones', foreignKey: 'preguntaId' });


Usuarios.belongsToMany(Evaluacion, { through: { model: PivotEvaluacionUsuario, unique: false }, as: 'evaluacionesRealizadas', foreignKey: 'evaluadorId' });
Usuarios.belongsToMany(Evaluacion, { through: { model: PivotEvaluacionUsuario, unique: false }, as: 'evaluacionesRecibidas', foreignKey: 'evaluadoId' });
Evaluacion.belongsToMany(Usuarios, { through: { model: PivotEvaluacionUsuario, unique: false }, as: 'usuariosEvaluados', foreignKey: 'evaluacionId' });

EvaluacionPreguntas.hasMany(EvaluacionRespuesta, { as: 'respuestas', foreignKey: 'preguntaId' });
EvaluacionRespuesta.belongsTo(EvaluacionPreguntas, { as: 'pregunta', foreignKey: 'preguntaId' });
EvaluacionRespuesta.belongsTo(Evaluacion, { as: 'evaluacion', foreignKey: 'evaluacionId' });
EvaluacionRespuesta.belongsTo(Usuarios, { as: 'evaluado', foreignKey: 'evaluadoId' });


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
    Acciones,
    Tareas,
    Proyectos,
    Hitos,
    Comentarios,
    Roles,
    Permisos,
    Trimestre,
    Rendimiento,
    Evaluacion,
    EvaluacionPreguntas,

    PivotTareasResponsables,
    PivotPerspEstr,
    PivotRespTact,
    PivotAreaTactico,
    PivotEstrResp,
    PivotOpUsuario,
    PivotProyectoUsuarios,
    PivotObjetivoTacticoTrimestre,


    UsuarioHitosOrden,
    GaleriaUsuarios,
    GaleriaDevarana,
    ConfiguracionUsuario
}



