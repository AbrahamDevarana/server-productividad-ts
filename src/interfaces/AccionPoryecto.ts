// Generated by https://quicktype.io

export interface AccionProyecto {
    accion: Accion;
}

export interface Accion {
    id:            string;
    nombre:        string;
    descripcion:   string;
    status:        number;
    propietarioId: string;
    hitoId:        string;
    fechaInicio:   string;
    fechaFin:      string;
    propietario:   Propietario;
}

export interface Propietario {
    id:              string;
    nombre:          string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    iniciales:       string;
    foto:            string;
}