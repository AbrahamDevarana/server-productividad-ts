interface IPagination {
    totalItem: number;
    rows: any[];
    totalPages: number;
    currentPage: number;
}

interface IPaginationOptions {
    offset: number;
    limit: number;
}

export const getPagingData = (data: any, page: number, limit: number): IPagination => {
    const { count: totalItem , rows } = data
    const currentPage = page ? + page : 0
    const totalPages = Math.ceil(totalItem / limit)
    return { totalItem, rows, totalPages, currentPage }
}

export const getPagination = (page: number, size: number): IPaginationOptions => {
    const limit = size ? + size : 10
    const offset = page ? page * limit : 0
    return { limit, offset }
}