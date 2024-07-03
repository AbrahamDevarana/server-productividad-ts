export interface HitosProps {
    id: string;
    titulo: string;
    descripcion: string;
    fechaInicio: Date;
    fechaFin: Date;
    status: number;
    color: string;
    progreso?: number;
    proyectoId: string;
}