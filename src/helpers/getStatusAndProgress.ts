
interface Props {
    progreso: number;
    status: string;
    objetivo: any;
}

export const getStatusAndProgress = ({progreso, status, objetivo}: Props) => {

        let statusFinal = status;
        let progresoFinal = progreso;

        if(progreso !== objetivo.progreso){
            if(progreso === 100){
                statusFinal = 'FINALIZADO';
            }else if (progreso === 0){
                statusFinal = 'SIN_INICIAR';
            }else if (progreso > 0 && progreso < 100){
                statusFinal = 'EN_TIEMPO';
            }
        }

    
        if(status !== objetivo.status){
            if(status === 'FINALIZADO'){
                progresoFinal = 100;
                statusFinal = 'FINALIZADO';
            }else if (status === 'EN PROGRESO'){
                statusFinal = 'EN PROGRESO';
            }else if ( status === 'SIN_INICIAR'){
                progresoFinal = 0;
                statusFinal = 'SIN_INICIAR';
            }
        }
    return {
        statusFinal,
        progresoFinal
    };
}