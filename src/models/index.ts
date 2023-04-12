import { Usuarios } from './Usuarios';
import { Areas } from './Areas';
import { Direccion } from './Direccion';
import { Departamentos } from './Departamentos';
import { Perspectivas } from './Perspectivas';
import { ObjetivoEstrategico } from './Estrategicos';
import { Tacticos } from './Tacticos';
import { ObjetivoOperativos } from './Operativos';



// Pivot tables
import { PivotPerspEstr } from './pivot/PivotPerspectivaEstrategia';
import { PivotEstrTact } from './pivot/PivotEstrategiaTactico';
import { PivotRespTact } from './pivot/PivotResponsablesTactico';
import { PivotAreaTactico } from './pivot/PivotAreaTactico';
import { PivotEstrResp } from './pivot/PivotEstrategiaResponsables';
import { PivotOpUsuario } from './pivot/PivotOperativoUsuario';
import { ResultadosClave } from './ResultadoClave';
import { Acciones } from './Acciones';




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

// Objetivo Estrategico
ObjetivoEstrategico.belongsTo(Usuarios, { as: 'propietario', foreignKey: 'propietarioId' });

// Tacticos
Tacticos.belongsTo(Usuarios, { as: 'propietario', foreignKey: 'propietarioId' });

// Resultados Clave
ResultadosClave.belongsTo(ObjetivoOperativos, { as: 'operativo', foreignKey: 'operativoId' });
ObjetivoOperativos.hasMany(ResultadosClave, { as: 'resultados_clave', foreignKey: 'operativoId' });
ResultadosClave.belongsTo(Usuarios, { as: 'propietario', foreignKey: 'propietarioId' });


// Perspectivas - Objetivo Estratégico
ObjetivoEstrategico.belongsToMany(Perspectivas, { as: 'perspectivas', through: PivotPerspEstr, onDelete: 'CASCADE', foreignKey: 'objEstrategicoId' });
// Objetivo Estratégico - Tacticos
ObjetivoEstrategico.belongsToMany(Tacticos, { as: 'tacticos', through: PivotEstrTact, onDelete: 'CASCADE', foreignKey: 'objEstrategicoId' });
// Objetivo Estratégico - Usuarios
ObjetivoEstrategico.belongsToMany(Usuarios, { as: 'responsables', through: PivotEstrResp, onDelete: 'CASCADE', foreignKey: 'objEstrategicoId' });


// Objetivos Tácticos  can be null
ObjetivoOperativos.belongsTo(Tacticos, { as: 'tactico_operativo', foreignKey: 'tacticoId', onDelete: 'SET NULL' });


// Perspectivas - Objetivo Estratégico
Perspectivas.belongsToMany(ObjetivoEstrategico, { as: 'objetivo_estr',  through: PivotPerspEstr, onDelete: 'CASCADE', foreignKey: 'perspectivaId' });

// Tacticos - Objetivo Estratégico
Tacticos.belongsToMany(ObjetivoEstrategico, { as: 'objetivo_tact',  through: PivotEstrTact, onDelete: 'CASCADE', foreignKey: 'tacticoId' });
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
ObjetivoOperativos.belongsTo(Usuarios, { as: 'propietario_op', foreignKey: 'propietarioId' });

ObjetivoOperativos.belongsToMany(Usuarios, { as: 'responsables_op', through: PivotOpUsuario, onDelete: 'CASCADE', foreignKey: 'objetivoOperativoId', otherKey: 'responsableId'});


// Acciones
Acciones.belongsTo(Usuarios, { as: 'propietario', foreignKey: 'propietarioId' });
Acciones.belongsTo(ResultadosClave, { as: 'accion_resultado', foreignKey: 'resultadoClaveId' });





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

    // Pivot tables
    PivotPerspEstr,
    PivotEstrTact,
    PivotRespTact,
    PivotAreaTactico,
    PivotEstrResp,
    PivotOpUsuario
}



