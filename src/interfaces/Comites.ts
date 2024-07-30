export interface ComitesProps {
    id?: string;
    titulo: string;
    descripcion?: string;
    icono?: string;
    imagen?: string;
    fechaInicio?: Date;
    fechaFin?: Date;
    propietarioId: string;
    status: 'SIN_INICIAR' | 'EN_PROCESO' | 'FINALIZADO' | 'CANCELADO' | 'DETENIDO' | 'RETRASADO';
    order: number;
    createdAt?: Date;
    updatedAt?: Date;
}