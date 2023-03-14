import { Usuarios } from './Usuarios';
import { Areas } from './Areas';
import { Direccion } from './Direccion';
import { Departamentos } from './Departamentos';


// Usuarios
Usuarios.belongsTo(Usuarios, { as: 'leader', foreignKey: 'leaderId' });
Usuarios.hasMany(Usuarios, { as: 'empleado', foreignKey: 'leaderId' });
Usuarios.belongsTo(Departamentos, { as: 'departamento', foreignKey: 'departamentoId' });
Usuarios.belongsTo(Direccion, { as: 'direccion', foreignKey: 'direccionId' });


// Áreas
Areas.hasMany(Areas, { as: 'subAreas', foreignKey: 'parentId' });
Areas.hasMany(Departamentos, { as: 'departamentos', foreignKey: 'areaId' });
Areas.belongsTo(Usuarios, { as: 'leader', foreignKey: 'leaderId' });


// Departamentos
Departamentos.belongsTo(Areas, { as: 'area', foreignKey: 'areaId' });
Departamentos.hasMany(Usuarios, { as: 'usuarios', foreignKey: 'departamentoId' });
Departamentos.belongsTo(Usuarios, { as: 'leader', foreignKey: 'leaderId' });


export {
    Usuarios,
    Areas,
    Direccion,
    Departamentos
}



