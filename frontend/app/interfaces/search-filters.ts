export interface SearchFilters{
    originLocationCode: string
    destinationLocationCode: string
    departureDate: string
    returnDate?: string 
    adults: string
    nonStop: string
    currencyCode: string
    sortBy:string
    page: string
    size: string
}