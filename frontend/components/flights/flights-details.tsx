'use client'

import { useEffect, useState } from "react"
import useFilters from "@/app/hooks/useFilters"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, CheckCircle2, ChevronLeft, ChevronRight, Clock, Plane, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { parseISO } from "date-fns"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FlightOffer, FlightSearchResponse, Price, Segment } from "@/app/interfaces/flight-results"


export default function FlightsDetails() {
  const {filters, setFilters}= useFilters()
  const [flightOffers, setFlightOffers]= useState<FlightOffer[]>([])
  const [dictionaries, setDictionaries]= useState<FlightSearchResponse["dictionaries"] | null>(null)
  const[isLoading, setIsLoading]=useState(false)
  const[isAirportLoading, setIsAirportLoading]=useState(false)
  const[currentPage, setCurrentPage]= useState(Number)
  const[totalPages, setTotalPages]= useState(Number)
  const [sortBy, setSortBy]=useState("price")
  const [totalResults, setTotalResults]=useState(0)
  const [airportResults, setAirportResults]= useState<Record<string,number>>({})
  const [selectedFlight, setSelectedFlight]= useState<FlightOffer | null>(null)
  const[isFlightSelected, setIsFlightSelected]=useState(false)
  const [isRoundTrip, setIsRoundTrip]= useState(false)
  const [activeTab, setActiveTab]=useState("outbound")


  const handleSortBy=(sortBy:string) =>{
    setFilters((prev)=> ({
      ...prev,
      sortBy})
    )
    setSortBy(sortBy)
  }

  const onPageChange = (newPage: number) => {
    setFilters((prev)=> ({
      ...prev,
      page: newPage.toString()
  }))
    
  }


  useEffect(()=>{
    const fetchFlights = async () => {
    try {
        setIsRoundTrip(!!filters.returnDate)
        setIsLoading(true)
        const response = await fetch(`http://localhost:8080/api/flights/search?origin=${filters.originLocationCode}&destination=${filters.destinationLocationCode}&departureDate=${filters.departureDate}&adults=${filters.adults}&currencyCode=${filters.currencyCode}&nonStop=${filters.nonStop}&returnDate=${filters.returnDate}&sortBy=${filters.sortBy}&page=${filters.page}&size=${filters.size}`)
        const data: FlightSearchResponse = await response.json()
        setFlightOffers(data.data)
        setDictionaries(data.dictionaries)
        setCurrentPage(data.meta.currentPage)
        setTotalPages(data.meta.totalPages)
        setTotalResults(data.meta.totalResults)

        console.log("Total Results", data.meta.totalResults)
        console.log("datos de vuelo", data)
      }
      catch (error){
        console.error("Hubo un error",error)
        return []
      } finally {
        setIsLoading(false)
      }
    }
    fetchFlights()
  }, [filters])


  useEffect(()=>{
    const fetchOriginResults = async () => {
      setIsAirportLoading(true)
      const visited = new Set()
      const newData: Record<string,number> = {}
      for (const offer of  flightOffers) {
        for (const segment of offer.itineraries[0].segments){
          if (!visited.has(segment.departure.iataCode)) {
                const newValue= await searchAirports(segment.departure.iataCode)
                newData[segment.departure.iataCode]= newValue
                visited.add(segment.departure.iataCode)
                await new Promise(resolve => setTimeout(resolve, 1000))
                
          }
          if (!visited.has(segment.arrival.iataCode)) {
            const newValue= await searchAirports(segment.arrival.iataCode)
            newData[segment.arrival.iataCode]= newValue
            visited.add(segment.arrival.iataCode)
            await new Promise(resolve => setTimeout(resolve, 1000))       
      }
        }
      
        if (offer.itineraries.length >1 ) {
          for (const segment of offer.itineraries[0].segments){
            if (!visited.has(segment.departure.iataCode)) {
                  const newValue= await searchAirports(segment.departure.iataCode)
                  newData[segment.departure.iataCode]= newValue
                  visited.add(segment.departure.iataCode)
                  await new Promise(resolve => setTimeout(resolve, 1000))
                  
            }
            if (!visited.has(segment.arrival.iataCode)) {
              const newValue= await searchAirports(segment.arrival.iataCode)
              newData[segment.arrival.iataCode]= newValue
              visited.add(segment.arrival.iataCode)
              await new Promise(resolve => setTimeout(resolve, 1000))
            }}}
            }
        console.log("new data y visited", newData, visited)
        setAirportResults(newData)
        setIsAirportLoading(false)
      }
  fetchOriginResults()

  }, [flightOffers])

  const getAirlineName= (carrierCode: string)=> {
    return dictionaries?.carriers?.[carrierCode] || carrierCode
  }

  const getLocationName =  (iataCode: string)=> {
    return airportResults[iataCode]
  }

  const searchAirports = async (keyword: string) => {
    try {
      // use commented response path and return statements when connecting to AMADEUS API
      // const response = await fetch(`http://localhost:8080/api/flights/airports?keyword=${keyword}&subType=AIRPORT,CITY&limit=1`)
      const response = await fetch(`http://localhost:8080/api/flights/fallback-airports?keyword=${keyword}&subType=AIRPORT,CITY&limit=1`)
      const data = await response.json()
      console.log("nombre de ", keyword, data)
      // return data.data[0].name || keyword
      return data[0].name
    }
    catch (error){
      console.log(error)
      return keyword
    } finally {

    }
  }

  const getAircraftName = (aircraftCode: string)=> {
    return dictionaries?.aircraft?.[aircraftCode]|| aircraftCode
  }

  const calculateLayover= (currentSegment: Segment, nextSegment: Segment)=> {
    const currentArrival= parseISO(currentSegment.arrival.at)
    const nextDeparture= parseISO(nextSegment.departure.at)

    const diffMinutes= Math.round((nextDeparture.getTime()- currentArrival.getTime())/(1000*60))
    const hours = Math.floor(diffMinutes/60)
    const minutes = diffMinutes%60

    return `${hours}H ${minutes}M`
  }

  const handleSelectedFlight=(flight: FlightOffer) => {
    setIsFlightSelected(true)
    setSelectedFlight(flight)
  }

  const handleBackToResults=() => {
    setIsFlightSelected(false)
    setSelectedFlight(null)
  }

  const calculateTotalFees = (price:Price)=> {
    return price.fees.reduce((total, fee)=> total + Number.parseFloat(fee.amount), 0)
  }


if (isFlightSelected && selectedFlight) {
  return (
    <div className="container mx-auto py-8 px-4">
      <Button variant="ghost" className="mb-6 flex items-center gap-2" onClick={handleBackToResults}>
        <ArrowLeft/> Back to all Flights
      </Button>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <span>{getAirlineName(selectedFlight.validatingAirlineCodes[0])}</span>
                    <Badge variant="outline">{selectedFlight.validatingAirlineCodes[0]}</Badge>
                  </CardTitle>
                  <CardDescription>
                    Flight {selectedFlight.itineraries[0].segments.map((s)=> s.number).join(" . ")}
                    <div className="text-right">
                  <div className="text-2xl font-bold">
                    {selectedFlight.price.currency} {(Number.parseFloat(selectedFlight.price.total).toFixed(2))}
                  </div>
                  <div className="text-sm text-muted-foreground">
                      {selectedFlight.price.currency}{(Number.parseFloat(selectedFlight.price.total)/Number(filters.adults)).toFixed(2)} per person
                  </div>
                </div>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          {isRoundTrip &&selectedFlight.itineraries.length>1 && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="outbound">Outbound Flight</TabsTrigger>
                <TabsTrigger value="return">Return Flight</TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          <div className={activeTab=== "outbound" ? "block" : "hidden"}>
            <h2 className="text-xl font-semibold mb-4">{isRoundTrip? "Outbound Flight": "Flight"} Details</h2>
            <div className="mb-4 flex items-center gap-2">
              <Clock/>
              <span className="font-medium">Total Duration {selectedFlight.itineraries[0].duration}</span>
              <Badge variant="secondary">
                {selectedFlight.itineraries[0].segments.length>1 ? `${selectedFlight.itineraries[0].segments.length -1} ${selectedFlight.itineraries[0].segments.length-1 ===1 ?"stop":"stops"}`: "Direct"}
              </Badge>
            </div>
            {selectedFlight.itineraries[0].segments.map((segment, segmentIndex)=> {
            const fareDetails= selectedFlight.travelerPricings[0].fareDetailsBySegment.find(
              (detail)=> detail.segmentId=== segment.id
            )

            return (
              <div key={segment.id} className="mb-6">
                <Card className="mb-4">
                  <CardContent className="pt-6">
                    <div className="flex items-start">
                      <div className="w=1/3">
                        <div className="text-1g font bold">{segment.departure.at}</div>
                        <div className="font-medium mt-1">
                          {getLocationName(segment.departure.iataCode)}  {segment.departure.iataCode}
                        </div>
                      </div>
                      <div className="w-1/3 flex flex-col items-center px-2">
                        <div className="test-sm text-muted-foreground mb-1">
                          {segment.duration}
                        </div>
                        <div className="relative w-full flex items-center justify-center">
                          <Separator className="w-full"/>
                          <div className="absolute bg-background px-2">
                            <Plane/>
                          </div>
                        </div>
                        <div className="text-xs text-center mt-1">
                          <div className="font-medium">{getAirlineName(segment.carrierCode)}</div>
                          <div className="text-muted-foreground">
                            {segment.carrierCode} {segment.number} | {getAircraftName(segment.carrierCode)}
                          </div>
                        </div>
                      </div>
                      <div className="w-1/3 text-right">
                        <div className="text-lg font-bold"> 
                          {segment.arrival.at}
                        </div>
                        <div className="font-medium mt-1">
                          {getLocationName(segment.arrival.iataCode)} {segment.arrival.iataCode}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Flight Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold mb-2">Flight Information</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Airline: {getAirlineName(segment.carrierCode)} ({segment.carrierCode})</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Flight Number: {segment.carrierCode} {segment.number}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Aircraft: {getAircraftName(segment.aircraft.code)} ({segment.aircraft.code})</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Duration: {segment.duration}</span>
                          </div>
                        </div>
                      </div>
                      {fareDetails && (
                        <div>
                          <h3 className="font-semibold mb-2">Fare Details</h3>
                          <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Cabin: {fareDetails.cabin}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Class: {fareDetails.class}</span>
                          </div>
                          </div>
                        </div>
                      )}
                      {fareDetails && (
                        <div className="mt-6">
                          <h3 className="font-semibold mb-2">Amenities</h3>
                          <div className="grid grid-cols-2 gap-2">
                            {fareDetails.amenities && fareDetails.amenities.map((amenity, amenityIndex)=> (
                              <div key={amenityIndex} className="flex items-center gap-2 p-2 border rounded-md">
                                <span>{amenity.description}</span>
                                Included: {amenity.isChargeable ? <X className="text-red-500"/> : <CheckCircle2 className="text-green-500"/>}
                                </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                {segmentIndex < selectedFlight.itineraries[0].segments.length - 1 && (
                  <div className="flex items-center justify-center py-4 px-4 rounded-md my-6">
                    <Clock/>
                    {calculateLayover(segment, selectedFlight.itineraries[0].segments[segmentIndex+1])}
                    layover at 
                    {getLocationName(segment.arrival.iataCode)} ({segment.arrival.iataCode})
                  </div>
                )}
            </div>
          )
          })}
        </div>
          {isRoundTrip && selectedFlight.itineraries.length>1 && (
            <div className={activeTab=== "return"? "block": "hidden"}>
              <h2 className="text-xl font-semibold mb-4">{isRoundTrip? "Inbound Flight": "Flight"} Details</h2>
              <div className="mb-4 flex items-center gap-2">
                <Clock/>
                <span className="font-medium">Total Duration {selectedFlight.itineraries[1].duration}</span>
                <Badge variant="secondary">
                  {selectedFlight.itineraries[1].segments.length>1 ? `${selectedFlight.itineraries[1].segments.length -1} ${selectedFlight.itineraries[1].segments.length-1 ===1 ?"stop":"stops"}`: "Direct"}
                </Badge>
              </div>
              {selectedFlight.itineraries[1].segments.map((segment, segmentIndex)=> {
                const fareDetails= selectedFlight.travelerPricings[0].fareDetailsBySegment.find(
                  (detail) => detail.segmentId === segment.id,
                )
                return (
                  <div key={segment.id} className="mb-6">
                    <Card className="mb-4">
                      <CardContent className="pt-6">
                        <div className="flex items-start">
                          <div className="w=1/3">
                            <div className="text-1g font bold">{segment.departure.at}</div>
                            <div className="font-medium mt-1">
                              {getLocationName(segment.departure.iataCode)}  {segment.departure.iataCode}
                            </div>
                          </div>
                          <div className="w-1/3 flex flex-col items-center px-2">
                            <div className="test-sm text-muted-foreground mb-1">
                              {segment.duration}
                            </div>
                            <div className="relative w-full flex items-center justify-center">
                              <Separator className="w-full"/>
                              <div className="absolute bg-background px-2">
                                <Plane/>
                              </div>
                            </div>
                            <div className="text-xs text-center mt-1">
                              <div className="font-medium">{getAirlineName(segment.carrierCode)}</div>
                              <div className="text-muted-foreground">
                                {segment.carrierCode} {segment.number} | {getAircraftName(segment.carrierCode)}
                              </div>
                            </div>
                          </div>
                          <div className="w-1/3 text-right">
                            <div className="text-lg font-bold"> 
                              {segment.arrival.at}
                            </div>
                            <div className="font-medium mt-1">
                              {getLocationName(segment.arrival.iataCode)}  {segment.arrival.iataCode}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Flight Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="font-semibold mb-2">Flight Information</h3>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Airline: {getAirlineName(segment.carrierCode)} ({segment.carrierCode})</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Flight Number: {segment.carrierCode} {segment.number}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Aircraft: {getAircraftName(segment.aircraft.code)} ({segment.aircraft.code})</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Duration: {segment.duration}</span>
                              </div>
                            </div>
                          </div>
                          {fareDetails && (
                            <div>
                              <h3 className="font-semibold mb-2">Fare Details</h3>
                              <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Cabin: {fareDetails.cabin}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Class: {fareDetails.class}</span>
                              </div>
                              </div>
                            </div>
                          )}
                          {fareDetails && (
                            <div className="mt-6">
                              <h3 className="font-semibold mb-2">Amenities</h3>
                              <div className="grid grid-cols-2 gap-2">
                                {fareDetails.amenities && fareDetails.amenities.map((amenity, amenityIndex)=> (
                                  <div key={amenityIndex} className="flex items-center gap-2 p-2 border rounded-md">
                                    <span>{amenity.description}</span>
                                    Included: {amenity.isChargeable ? <X className="text-red-500"/> : <CheckCircle2 className="text-green-500"/>}
                                    </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                    {segmentIndex < selectedFlight.itineraries[1].segments.length - 1 && (
                      <div className="flex items-center justify-center py-4 px-4 rounded-md my-6">
                        <Clock/>
                        {calculateLayover(segment, selectedFlight.itineraries[1].segments[segmentIndex+1])}
                        layover at 
                        {getLocationName(segment.arrival.iataCode)} ({segment.arrival.iataCode})
                      </div>
                    )}
                </div>
              )
              })}
            </div>
          )}  
        </div>
     <div className="col-span-1">
        <Card className="sticky top-6">
          <CardHeader>
            <CardTitle>Price Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
          <div className="space-y-4">
          <div className="flex justify-between">
              <span>Base Price</span>
              <span className="text-medium">{selectedFlight.price.currency} {Number.parseFloat(selectedFlight.price.base).toFixed(2)}</span>
            </div>
            {selectedFlight.price.fees.length>0 &&(
              <>         
              <div className="flex justify-between">
                <span>Fees & Taxes</span>
                <span className="text-medium">{selectedFlight.price.currency} {calculateTotalFees(selectedFlight.price).toFixed(2)}</span>
              </div>
              <div className="pl-4 mt-2 space-y-1 text-sm">
                {selectedFlight.price.fees.map((fee,index)=> (
                  <div key={index} className="flex justify-between">
                    <span>{fee.type}</span>
                    <span>{selectedFlight.price.currency} {Number.parseFloat(fee.amount).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              </>  
            )}
            <Separator/>
            <div className="flex justify-between font-bold">
              <span>Total Price:</span>
              <span>{selectedFlight.price.currency}  {Number.parseFloat(selectedFlight.price.total)}</span>
            </div>
            <div className="flex font-medium">
              Adults: {filters.adults}
            </div>
            {Number(filters.adults) > 1 && (
              <div className="flex justify-between text-md">
                <span>Price per traveler: </span>
                <span>{selectedFlight.price.currency}  {(Number.parseFloat(selectedFlight.price.total)/ Number(filters.adults)).toFixed(2)}</span>
              </div>
            )}
          </div>
        </CardContent>
        </Card>
        
      </div>
      </div>
      


    </div>
  )
}

if (isLoading) {
    return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin h-50 w-50 border-2 border-primary border-t-transparent rounded-full"></div>
    </div>
  )}
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-2">Flight Results</h1>
      <p className="mb-6">Found {totalResults} flights matching your search</p>
      <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full">SortBy: {sortBy==="id"? "": sortBy}</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" >
                    <DropdownMenuLabel>Choose price/duration</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup value={sortBy} onValueChange={handleSortBy}>
                    <DropdownMenuRadioItem value="price">Price</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="duration">Duration</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                </DropdownMenuContent>
            </DropdownMenu>
      <div className="space-y-6">
        {flightOffers.map((offer)=> (
          <Card key={offer.id} className="w-full hver:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <span>{getAirlineName(offer.validatingAirlineCodes[0])}</span>
                    <span>{offer.validatingAirlineCodes[0]}</span>
                  </CardTitle>
                  <CardDescription>
                    Flight {offer.itineraries[0].segments.map((s)=> s.number).join(" . ")}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {offer.price.currency} {(Number.parseFloat(offer.price.total).toFixed(2))}
                  </div>
                  <div className="text-sm text-muted-foreground">
                      {offer.price.currency}{(Number.parseFloat(offer.price.total)/Number(filters.adults)).toFixed(2)} per person
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {offer.itineraries.map((itinerary, itineraryIndex)=> (
                <div key={itineraryIndex} className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock/>
                    <span> Total Duration: {itinerary.duration} </span>
                    <Badge>
                      {itinerary.segments.length> 1 ? `${itinerary.segments.length-1} ${itinerary.segments.length -1 === 1 ? "stop" : "stops"}`: "Non-Stop"}
                    </Badge>
                    <div>
                    {isAirportLoading ?             <div >
              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>: <>
            From: {getLocationName(itinerary.segments[0].departure.iataCode)}{"  "}({itinerary.segments[0].departure.iataCode}) {"   "}
                      To: {getLocationName(itinerary.segments[itinerary.segments.length-1].arrival.iataCode)}{"  "}({itinerary.segments[itinerary.segments.length-1].arrival.iataCode})</>}
                      
                    </div>
                    <div>
                    Departure {itinerary.segments[0].departure.at}
                    Arrival {itinerary.segments[0].departure.at}
                    </div>
                  </div>
                  {itinerary.segments.map((segment , segmentIndex)=> (
                    <div key={segment.id} className="space-y-2">
                      <div className="flex-items-start">
                        {segmentIndex < itinerary.segments.length - 1 && (
                          <div>
                            <Clock/>
                            <span className="text-sm">Layover At {getLocationName(segment.arrival.iataCode)}  {segment.arrival.iataCode}  {calculateLayover(segment, itinerary.segments[segmentIndex+1])}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
              <Button onClick={()=> {handleSelectedFlight(offer)}}>
                Ver detalles
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="w-full flex items-center justify-center mt-3">
          <Button onClick={()=>onPageChange(currentPage-1)} 
          disabled={currentPage === 1}
          >
            <ChevronLeft/>
          </Button>
          <Label className="text-lg"> {currentPage} </Label>
          <Button onClick={()=> onPageChange(currentPage+1)} 
          disabled={currentPage === totalPages}
          >
          <ChevronRight/>
          </Button>
      </div>
    </div>
  )
}