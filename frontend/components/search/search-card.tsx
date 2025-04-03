'use client'
import { useState, useEffect } from "react"
import { Calendar } from "../ui/calendar"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { CalendarIcon, DollarSign, MinusCircle, PlaneLanding, PlaneTakeoff, PlusCircle } from "lucide-react"
import {format} from "date-fns"
import { Checkbox } from "../ui/checkbox"
import useFilters from "@/app/hooks/useFilters"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { useRouter } from "next/navigation"
import { AirportResult } from "@/app/interfaces/flight-results"

const currencyCodes = [
  {code:"USD", name: "United States Dollar"}, 
  {code: "MXN", name: "Mexican Peso"},
  {code: "EUR", name:"Euro"},
  {code: "AUD", name: "Australian Dollar"},
  {code: "GBP", name: "Pound Sterling"},
  {code: "JPY", name: "Japanese Yen"}
  ]

export default function FlightSearchForm() {
  const {filters, setFilters}= useFilters()
  const [origin, setOrigin]= useState(filters.originLocationCode)
  const [destination, setDestination]= useState(filters.destinationLocationCode)
  const [adults, setAdults]=useState(Number(filters.adults))
  const [originResults, setOriginResults]= useState<AirportResult[]>([])
  const [destinationResults, setDestinationResults]= useState<AirportResult[]>([])
  const [showOriginResults, setShowOriginResults]= useState(false)
  const [showDestinationResults, setShowDestinationResults]= useState(false)
  const [isLoadingOrigin, setIsLoadingOrigin]= useState(false)
  const [isLoadingDestination, setIsLoadingDestination]= useState(false)
  const [departureDate, setDepartureDate]= useState<Date| undefined>(undefined)
  const [isNonStop, setIsNonStop]= useState(filters.nonStop==="true")
  const [isRoundTrip, setIsRoundTrip]= useState(false)
  const [returnDate, setReturnDate]= useState<Date| undefined>(undefined)
  const [currencyCode, setCurrencyCode]= useState("USD")
  const router= useRouter()

  

  const searchAirports = async (keyword: string, typeofAirport:string): Promise<AirportResult[]> => {
    if (keyword.length <3) return []

    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      {typeofAirport ==="origin" ? setIsLoadingOrigin(true) : setIsLoadingDestination(true)}
      // remove word fallback when working with Amadeus API and change return statement
      const response = await fetch(`http://localhost:8080/api/flights/fallback-airports?keyword=${keyword}&subType=AIRPORT,CITY&limit=10`)
      const data = await response.json()
      console.log('respuesta origen', data)
      // return data.data || []
      return data.data || data
    }
    catch (error){
      console.error("Hubo un error",error)
      return []
    } finally {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      {typeofAirport ==="origin" ? setIsLoadingOrigin(false) : setIsLoadingDestination(false)}
    }
  }

  useEffect(()=> {
    const fetchOriginResults = async () => {
      if (origin.length >=3) {
        setIsLoadingOrigin(true)
        const results = await searchAirports(origin, "origin")
        setOriginResults(results)
        setShowOriginResults(results.length>0)
        setIsLoadingOrigin(false)
      }
    }
    const debounceTimer = setTimeout(fetchOriginResults, 300)
    return () => clearTimeout(debounceTimer)
  }, [origin])

  useEffect(()=> {
    const fetchDestinationResults = async () => {
      if (destination.length >=3) {
        setIsLoadingDestination(true)
        const results = await searchAirports(destination, "destination")
        setDestinationResults(results)
        setShowDestinationResults(results.length>0)
        setIsLoadingDestination(false)
      }
    }
    const debounceTimer = setTimeout(fetchDestinationResults, 300)
    return () => clearTimeout(debounceTimer)
  }, [destination])

  const handleOriginSelect = (airport: AirportResult) => {
    setOrigin(airport.iataCode)
    setShowOriginResults(false)
    setFilters((prev)=> ({
      ...prev,
      originLocationCode: airport.iataCode}))
    console.log("aeropuerto seleccionado", airport)
  }

  const handleDestinationSelect = (airport: AirportResult) => {
    setDestination(airport.iataCode)
    setShowDestinationResults(false)
    setFilters((prev)=> ({
      ...prev,
      destinationLocationCode: airport.iataCode}))
    console.log("aeropuerto seleccionado destino", airport)
  }

  useEffect(()=> {
    console.log("filtros",filters)
  }, [filters])

  const handleIncrementAdults = () => {
    setFilters((prev)=> ({
      ...prev,
      adults: (adults+1).toString()
    }))
    setAdults((prev)=> prev+1)
  }

  const handleDecrementAdults= () => {
    setFilters((prev)=> ({
      ...prev,
      adults: adults > 1 ? (adults-1).toString() : "1"
    }))
    setAdults((prev)=> (prev>1 ? prev-1 : 1))
  }


  useEffect(()=> {
    setFilters((prev)=> ({
      ...prev,
      departureDate: departureDate ? departureDate.toISOString().split("T")[0] : ""
    }))
  }, [departureDate, setFilters])

  useEffect(()=> {
    setFilters((prev)=> ({
      ...prev,
      returnDate: returnDate ? returnDate.toISOString().split("T")[0] : ""
    }))
  }, [returnDate, setFilters])

  const handleNonStop= (checked:boolean)=> {
      setFilters((prev)=> ({
      ...prev,
      nonStop: checked===true ? "true" : "false"
    }))
    setIsNonStop(checked === true)
  }

  const handleRoundTrip= (checked:boolean)=> {
    setIsRoundTrip(checked === true)
    if (!checked) {
      setReturnDate(undefined)
    }
  }

  useEffect(()=> {
    setFilters((prev)=> ({
      ...prev,
      currencyCode
    }))
  }, [currencyCode, setFilters])

  const handleSearchFlights= ()=> {
    router.push("/flights")
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-card rounded-lg shadow-md">
      <h2 className="text-2xl font-bopld mb-6 text-center">Flight Search</h2>
      <div className="space-y-2 mt-2">
        <Label htmlFor="origin" className="flex items-center">
          Origin <span className="text-destructive ml-1">*</span>
        </Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <PlaneTakeoff className="h-4 w-4 text-muted-foreground"/>
          </div>
          <Input 
          id="origin"
          type="text"
          placeholder="Enter city or airport code"
          value= {origin}
          onChange={(e)=> setOrigin(e.target.value)}
          className="pl-10"
          onBlur= { ()=> {
            setTimeout(()=> setShowOriginResults(false), 200)
          }}
          onFocus={()=> {
            if (origin.length >=3) {
              setShowOriginResults(true)
            }
          }}
          />
          {isLoadingOrigin && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
          )}
          {showOriginResults && originResults.length>0 && (
            <div className="absolute z-10 w-full mt-1 bg-popover rounded-md shadow-lg max-h-60 overflow-auto">
              <ul className="py-1">
                {originResults.map((airport, index)=> (
                  <li key={index} className="px-4 py-2 hover:bg-accent cursor-pointer" onClick={()=> handleOriginSelect(airport)}>
                    {airport.iataCode}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      <div className="space-y-2 mt-2">
        <Label htmlFor="destination" className="flex items-center">
          Destination <span className="text-destructive ml-1">*</span>
        </Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <PlaneLanding className="h-4 w-4 text-muted-foreground"/>
          </div>
          <Input 
          id="destination"
          type="text"
          placeholder="Enter city or airport code"
          value= {destination}
          onChange={(e)=> setDestination(e.target.value)}
          className="pl-10"
          onBlur= { ()=> {
            setTimeout(()=> setShowDestinationResults(false), 200)
          }}
          onFocus={()=> {
            if (origin.length >=3) {
              setShowDestinationResults(true)
            }
          }}
          />
          {isLoadingDestination && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
          )}
          {showDestinationResults && destinationResults.length>0 && (
            <div className="absolute z-10 w-full mt-1 bg-popover rounded-md shadow-lg max-h-60 overflow-auto">
              <ul className="py-1">
                {destinationResults.map((airport, index)=> (
                  <li key={index} className="px-4 py-2 hover:bg-accent cursor-pointer" onClick={()=> handleDestinationSelect(airport)}>
                    {airport.iataCode}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      <div className="space-y-2 mt-2">
        <Label htmlFor="adults" className="flex items-center">
            Adults <span className="text-destructive ml-1">*</span>
        </Label>
        <div className="flex items-center">
          <Button
            disabled={adults<=1}
            onClick={handleDecrementAdults}
            size="icon">
            <MinusCircle/>
          </Button>
          <Input
            id="adults"
            type="number"
            min={1}
            value={adults}
            onChange={(e)=> setAdults(Number.parseInt(e.target.value))}
            readOnly
          />
          <Button
            onClick={handleIncrementAdults}
            size="icon">
            <PlusCircle/>
          </Button>
        </div>
      </div>
      <div className="space-y-2 mt-2">
        <Label htmlFor="departureDate" className="flex items-center">
          Departure Date <span className="text-destructive ml-1">*</span>
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
            id="departureDate"
            variant="outline">
              <CalendarIcon className="mr-2 h-4 w-4"/>
              {departureDate ? format(departureDate, "PPP"): "Select Departure Date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={departureDate}
              onSelect={setDepartureDate}
              disabled={(date)=> date < new Date()}
              />
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex items-center space-x-2 mt-2">
        <Checkbox
          id="isNonStop"
          checked={isNonStop}
          onCheckedChange={handleNonStop}/>
        <Label htmlFor="isNonStop">
          Non-Stop
        </Label>
      </div>
      <div className="flex items-center space-x-2 mt-2">
        <Checkbox
          id="isRoundTrip"
          checked={isRoundTrip}
          onCheckedChange={handleRoundTrip}/>
        <Label htmlFor="isRoundTrip">
          Round Trip
        </Label>
      </div>
      {isRoundTrip && (
              <div className="space-y-2 mt-2">
              <Label htmlFor="returnDate" className="flex items-center">
                ReturnDate <span className="text-destructive ml-1">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                  id="returnDate"
                  variant="outline">
                    <CalendarIcon className="mr-2 h-4 w-4"/>
                    {returnDate ? format(returnDate, "PPP"): "Select Return Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={returnDate}
                    onSelect={setReturnDate}
                    disabled={departureDate ? (date)=> date < new Date() || date < departureDate : (date)=> date < new Date() }
                    />
                </PopoverContent>
              </Popover>
            </div>
      )}
            <Button onClick={handleSearchFlights} type="submit">
        Search Flights
      </Button>
      <div className="space-y-2 mt-2">
        <Label htmlFor="currencyCode" className="flex items-center">
            Currency <span className="text-destructive ml-1">*</span>
        </Label>
        <Select value={currencyCode} onValueChange={setCurrencyCode}>
          <SelectTrigger id="currencyCode">
            <div className="flex items-center">
              <DollarSign/>
              <SelectValue placeholder="Select Currency"/>
            </div>
          </SelectTrigger>
          <SelectContent>
            {currencyCodes.map((currency)=> (
              <SelectItem key={currency.code} value={currency.code}>
                <span>{currency.code}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

    </div>
  )
}
