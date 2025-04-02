import { createContext, Dispatch, SetStateAction } from 'react';
import { SearchFilters } from './interfaces/search-filters';

interface SearchFiltersContextContent {
    filters: SearchFilters,
    setFilters: Dispatch<SetStateAction<SearchFilters>>
}
export const FilterContext= createContext<SearchFiltersContextContent>({
    filters:{
        originLocationCode: "",
        destinationLocationCode:"",
        departureDate:"",
        returnDate:"",
        adults:"1",
        nonStop:"",
        currencyCode:"USD",
        sortBy: "price",
        page: "1",
        size: "10"
      },
    setFilters: ()=>{}
})
