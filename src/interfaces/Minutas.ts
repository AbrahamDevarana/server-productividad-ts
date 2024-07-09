export interface MinutasProps {
    id: string;
    titulo: string;
    descripcion: string;
    fecha: Date;
    minuteableType: 'PROYECTO' | 'OBJETIVO_OPERATIVO';
    authorId: string;
    minuteableId: string;
    updatedAt: Date;
}