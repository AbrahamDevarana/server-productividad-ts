export interface EvaluacionRespuestaProps {
    resultado: number;
    comentario: string;
    pivot_evaluacion_usuario: {
        evaluadorId: string;
    };
}

export interface EvaluacionPreguntaProps {
    id: number;
    texto: string;
    descripcion: string | null;
    categoriaPreguntaId: number;
    evaluacion_respuesta: EvaluacionRespuestaProps[];
    evaluacion_pregunta: EvaluacionPreguntaProps[];
}

export interface CategoriaProps {
    id: number;
    nombre: string;
    preguntas: EvaluacionPreguntaProps[];
}

export interface EvaluacionResultadoProps {
    promedio: string | number;
    respuestas: {
        usuario: string[];
        otras: string[];
    };
}

export interface EvaluacionPreguntaProps {
    id: number;
    texto: string;
    descripcion: string | null;
    categoriaPreguntaId: number;
}

