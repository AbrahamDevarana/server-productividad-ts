import { AreaInterface, UsuarioInterface } from ".";

export interface DepartamentoInterface {
    id:        number;
    nombre:    string;
    areaId:    number;
    leaderId:  string;
    status:    boolean;
    slug:      string;
    area:      AreaInterface;
    leader:    UsuarioInterface;
    color:     string;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
}