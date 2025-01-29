export const getBono = (total: number) => {

    const rangos: { [key: number]: number } = {
        0: 0,
        85: 0,
        86: 75,
        88: 80,
        90: 85,
        92: 90,
        94: 95,
        96: 100,
        98: 105,
        100: 110,
    };

    let puntuacion = 0;
    for (let rango in rangos) {
        if (total >= parseInt(rango)) {                
            puntuacion = rangos[rango];
        } else {
            break;
        }
    }

    return puntuacion;

} 