export interface FlightSearchResponse {
    meta: {
      totalPages: number
      totalResults:number
      currentPage: number
    }
    data: FlightOffer[]
    dictionaries: {
      locations: {
        [code:string]: {
          cityCode: string
          countryCode: string
          name?: string
        }
      }
      aircraft: {
        [code: string]: string
      }
      currencies: {
        [code:string]: string
      }
      carriers: {
        [code:string]: string
      }
    }
  }
  
export interface FlightOffer {
    type: string
    id: string
    source: string
    instantTicketingRequired: boolean
    nonHomogeneus: boolean
    oneWay: boolean
    lastTicketingDate: string
    numberOfBookableSeats: number
    itineraries: Itinerary[]
    price: Price 
    pricingOptions: {
      fareType: string[]
      includedCheckedBagsOnly: boolean
    }
    validatingAirlineCodes: string[]
    travelerPricings: TravelerPricing[]
  }
  
  interface Itinerary {
    duration: string
    segments: Segment[]
  }
  
  interface Segment {
    departure : {
      iataCode: string 
      terminal?:string
      at:string
    }
    arrival : {
      iataCode: string 
      terminal?:string
      at:string
    }
    carrierCode: string
    number: string
    aircraft: {
      code:string   
    }
    operating: {
      carrierCode: string
    }
    duration: string
    id:string
    numberOfStops: number
    blacklistedInEU: boolean
  }
  
export interface Price {
    currency: string
    total: string
    base:string
    fees: {
      amount: string
      type: string
    }[]
    grandTotal: string
  }

export interface TravelerPricing {
    travelerId: string
    fareOption: string
    travelerType: string
    price: {
      currency:string
      total: string
      base: string
  
    }
    fareDetailsBySegment: {
      segmentId: string
      cabin: string
      fareBasis: string
      class: string
      includedCheckedBags: {
        weight?: number
        weightUnit?: string
        quantity?: string
      }
      amenities: {
        description: string
        isChargeable: boolean
        amenityType: string
      }[]
    }[]
  }
  
  
 export interface AirportResult {
    iataCode: string
    name?: string
    city?: string
    country?:string
    type: string
  }