import dayjs from '../helpers/dayjs';

export const getQuarterMonths = (quarter: number, year: number) => {
    const startMonth = (quarter - 1) * 3; // Determina el mes inicial del trimestre (0 indexado).
    const months = [0, 2].map(offset => dayjs().year(year).month(startMonth + offset).format('MMMM'));
    const shortMonths = [0, 2].map(offset => dayjs().year(year).month(startMonth + offset).format('MMM'));
    return {shortMonths, months};
};