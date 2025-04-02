import { useContext } from "react";
import { FilterContext } from "../context";


export default function useFilters(){

    const {filters, setFilters}=useContext(FilterContext)

    return {filters, setFilters}
}