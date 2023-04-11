import { DepartamentoInterface, DireccionInterface } from "./";


export type UsuarioInterface = {
    id:                string;
    nombre:            string;
    apellidoPaterno:   string;
    apellidoMaterno:   string;
    iniciales:         string;
    nombreCorto?:       string;
    email:             string;
    foto?:              string;
    fechaNacimiento?:   Date;
    fechaIngreso?:      Date;
    telefono?:          number;
    puesto?:            string;
    descripcionPerfil?: string;
    status?:            boolean;
    direccionId:       number;
    direccion:         DireccionInterface;
    leaderId:          string;
    leader:    UsuarioInterface;
    departamentoId:    number;
    departamento:      DepartamentoInterface;    
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
    
}
