import { UsuarioInterface } from "./Usuario";

export interface TareaInterface {
    id:            string;
    nombre:        string;
    descripcion:   string;
    status:        number;
    hitoId:        string;
    fechaInicio:   string;
    fechaFin:      string;
    propietarioId: string;
    propietario:   UsuarioInterface;
    participantesId: string[];
}
