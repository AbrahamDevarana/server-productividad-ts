export interface Report {
    id:             number;
    nombre:         string;
    departamentos?: Departamento[];
    color:          string;
    leader: Usuario
    slug:           string;
}

export interface Departamento {
    id:       number;
    nombre:   string;
    leader:   string;
    usuarios: Usuario[];
    color:    string;
}

export interface Usuario {
    id:                  string;
    nombre:              string;
    apellidoPaterno:     string;
    apellidoMaterno:     null | string;
    foto:                string;
    puesto:              string;
    rendimientoActual:   RendimientoA;
    rendimientoAnterior: RendimientoA;
    mayor?:              boolean;
    email:               string;
}

export interface RendimientoA {
    resultadoObjetivos:    number;
    resultadoCompetencias: number;
    resultadoFinal:        number;
    bono?:                 number;
}

