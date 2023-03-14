import { Usuarios } from './Usuarios';
import { Areas } from './Areas';
import { Direccion } from './Direccion';
import { Departamentos } from './Departamentos';


// Usuarios
Usuarios.belongsTo(Usuarios, { as: 'leader', foreignKey: 'leaderId' });
Usuarios.hasMany(Usuarios, { as: 'empleado', foreignKey: 'leaderId' });
Usuarios.belongsTo(Departamentos, { as: 'departamento', foreignKey: 'departamentoId' });
Usuarios.belongsTo(Direccion, { foreignKey: 'direccionId', as: 'direccion' });


// Áreas
Areas.hasMany(Areas, { as: 'subAreas', foreignKey: 'parentId' });
Areas.hasMany(Departamentos, { as: 'departamentos', foreignKey: 'areaId' });


// Departamentos
Departamentos.belongsTo(Areas, { as: 'area', foreignKey: 'areaId' });
Departamentos.hasMany(Usuarios, { as: 'usuarios', foreignKey: 'departamentoId' });


export {
    Usuarios,
    Areas,
    Direccion,
    Departamentos
}



