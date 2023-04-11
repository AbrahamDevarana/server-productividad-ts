import { UsuarioInterface } from "./";

export interface AreaInterface {
    id:        number;
    nombre:    string;
    parentId:  UsuarioInterface;
    leaderId:  AreaInterface;
    slug:      string;
    status:    boolean;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
}