import { Usuarios } from './Usuarios';
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



// Pivot tables
import { PivotPerspEstr } from './pivot/PivotPerspectivaEstrategia';
import { PivotRespTact } from './pivot/PivotResponsablesTactico';
import { PivotAreaTactico } from './pivot/PivotAreaTactico';
import { PivotEstrResp } from './pivot/PivotEstrategiaResponsables';
import { PivotOpUsuario } from './pivot/PivotOperativoUsuario';
import { PivotAcciones } from './pivot/PivotAcciones';
import { PivotTareasResponsables } from './pivot/PivotTareasResponsables';
import UsuarioHitosOrden from './custom/UsuarioHitosOrden';
import { PivotProyectoUsuarios } from './pivot/PivotProyectoUsuarios';




// Usuarios
Usuarios.belongsTo(Usuarios, { as: 'leader', foreignKey: 'leaderId' });
Usuarios.hasMany(Usuarios, { as: 'empleado', foreignKey: 'leaderId' });
Usuarios.belongsTo(Departamentos, { as: 'departamento', foreignKey: 'departamentoId' });
Usuarios.belongsTo(Direccion, { as: 'direccion', foreignKey: 'direccionId', onDelete: 'SET NULL' });

// Áreas
Areas.hasMany(Areas, { as: 'subAreas', foreignKey: 'parentId' });
Areas.hasMany(Departamentos, { as: 'departamentos', foreignKey: 'areaId' });
Areas.belongsTo(Usuarios, { as: 'leader', foreignKey: 'leaderId' });


// Departamentos
Departamentos.belongsTo(Areas, { as: 'area', foreignKey: 'areaId' });
Departamentos.hasMany(Usuarios, { as: 'usuarios', foreignKey: 'departamentoId' });
Departamentos.belongsTo(Usuarios, { as: 'leader', foreignKey: 'leaderId' });

// Perspectivas
Perspectivas.hasMany(ObjetivoEstrategico, { as: 'objetivos_estrategicos', foreignKey: 'perspectivaId' });

// Objetivo Estrategico
ObjetivoEstrategico.belongsTo(Usuarios, { as: 'propietario', foreignKey: 'propietarioId' });
ObjetivoEstrategico.hasMany(Tacticos, { as: 'tacticos', foreignKey: 'estrategicoId' });
ObjetivoEstrategico.belongsTo(Perspectivas, { as: 'perspectivas', foreignKey: 'perspectivaId' });

// Tacticos
Tacticos.belongsTo(Usuarios, { as: 'propietario', foreignKey: 'propietarioId' });
Tacticos.belongsTo(ObjetivoEstrategico, { as: 'estrategico', foreignKey: 'estrategicoId' });

// Objetivo Operativo
ObjetivoOperativos.belongsTo(Usuarios, { as: 'propietario_op', foreignKey: 'propietarioId' });
ObjetivoOperativos.belongsTo(Tacticos, { as: 'tactico_operativo', foreignKey: 'tacticoId', onDelete: 'SET NULL' });
ObjetivoOperativos.hasMany(ResultadosClave, { as: 'resultados_clave', foreignKey: 'operativoId' });

// Resultados Clave
ResultadosClave.belongsTo(ObjetivoOperativos, { as: 'operativo', foreignKey: 'operativoId' });
ResultadosClave.belongsTo(Usuarios, { as: 'propietario', foreignKey: 'propietarioId' });

// Proyectos
Proyectos.hasMany(Hitos, { as: 'proyectosHito', foreignKey: 'proyectoId', onDelete: 'CASCADE' });
Proyectos.belongsTo(Usuarios, { as: 'propietario', foreignKey: 'propietarioId' });

Proyectos.belongsToMany(Usuarios, { through: PivotProyectoUsuarios, as: 'usuariosProyecto', foreignKey: 'proyectoId' });
Usuarios.belongsToMany(Proyectos, { through: PivotProyectoUsuarios, as: 'proyectosUsuario', foreignKey: 'usuarioId' });

// Hitos
Hitos.belongsTo(Proyectos, { as: 'hitosProyecto', foreignKey: 'proyectoId', onDelete: 'CASCADE' });
Hitos.hasMany(Tareas, { as: 'tareas', foreignKey: 'hitoId' });
Hitos.belongsToMany(Usuarios, { through: UsuarioHitosOrden, as: 'ordenHito', foreignKey: 'hitoId' })
Usuarios.belongsToMany(Hitos, { through: UsuarioHitosOrden, as: 'ordenHito', foreignKey: 'usuarioId' })


// Tareas 
Tareas.belongsTo(Usuarios, { as: 'propietario', foreignKey: 'propietarioId' });
Tareas.belongsTo(Hitos, { as: 'tareas', foreignKey: 'hitoId' });



//* ----------------- Pivot tables -----------------

// Objetivo Estratégico - Usuarios
ObjetivoEstrategico.belongsToMany(Usuarios, { as: 'responsables', through: PivotEstrResp, onDelete: 'CASCADE', foreignKey: 'objEstrategicoId' });

// Perspectivas - Objetivo Estratégico
Perspectivas.belongsToMany(ObjetivoEstrategico, { as: 'objetivo_estr',  through: PivotPerspEstr, onDelete: 'CASCADE', foreignKey: 'perspectivaId' });

// Tacticos - Objetivo Estratégico

// Tacticos - Usuarios
Tacticos.belongsToMany(Usuarios, { as: 'responsables', through: PivotRespTact, onDelete: 'CASCADE', foreignKey: 'tacticoId' });

// Tacticos - Áreas
Tacticos.belongsToMany(Areas, { as: 'areas', through: PivotAreaTactico, onDelete: 'CASCADE', foreignKey: 'areaId' });

// Áreas - Tacticos
Areas.belongsToMany(Tacticos, { as: 'tacticos', through: PivotAreaTactico, onDelete: 'CASCADE', foreignKey: 'tacticoId' });

// Usuarios - Tacticos
Usuarios.belongsToMany(Tacticos, { as: 'tacticos', through: PivotRespTact, onDelete: 'CASCADE', foreignKey: 'responsableId' });

// Usuarios - Objetivo Estratégico
Usuarios.belongsToMany(ObjetivoEstrategico, { as: 'objetivo_estr', through: PivotEstrResp, onDelete: 'CASCADE', foreignKey: 'responsableId' });

// Objetivo Operativo
ObjetivoOperativos.belongsToMany(Usuarios, { as: 'responsables_op', through: PivotOpUsuario, onDelete: 'CASCADE', foreignKey: 'objetivoOperativoId', otherKey: 'responsableId'});


Tareas.belongsToMany(Usuarios, { as: 'participantes', through: PivotTareasResponsables, onDelete: 'CASCADE', foreignKey: 'tareaId' });
Usuarios.belongsToMany(Tareas, { as: 'tareas', through: PivotTareasResponsables, onDelete: 'CASCADE', foreignKey: 'responsableId' });


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

    PivotTareasResponsables,
    PivotPerspEstr,
    PivotRespTact,
    PivotAreaTactico,
    PivotEstrResp,
    PivotOpUsuario,
    PivotProyectoUsuarios,


    UsuarioHitosOrden
}



