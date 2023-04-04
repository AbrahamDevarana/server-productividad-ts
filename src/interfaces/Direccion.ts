export interface DireccionInterface {
    id:        number;
    calle?:     string;
    numeroExterior?: string;
    numeroInterior?: string;
    colonia?:   string;
    codigoPostal?: string;
    ciudad?:    string;
    estado?:    string;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
}
