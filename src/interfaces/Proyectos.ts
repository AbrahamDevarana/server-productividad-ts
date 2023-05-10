
export interface ProyectosProps {
    id: string;
    titulo: string;
    descripcion: string;
    icono: string;
    imagen: string;
    fechaInicio: Date;
    fechaFin: Date;
    status: string;
    propietarioId: string;
    participantes: string[];
}