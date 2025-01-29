export const getPreviousQuarter = (quarter: number, year: number) => {
    if (quarter === 1) {
        return { quarter: 4, year: year - 1 }; // Si es Q1, regresa Q4 del año anterior.
    }
    return { quarter: quarter - 1, year }; // En cualquier otro caso, regresa el quarter anterior del mismo año.
};