'use client'

import { ReactNode, useState } from "react"
import { FilterContext } from "./context"
import { SearchFilters } from "./interfaces/search-filters"

export function Providers({ children }: {children: ReactNode}) {
      const [filtersInContext,setFiltersInContext]=useState<SearchFilters>({
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
      })
    return(
        <FilterContext.Provider value={{filters: filtersInContext, setFilters: setFiltersInContext}}>
            {children}
        </FilterContext.Provider>
    )
}

