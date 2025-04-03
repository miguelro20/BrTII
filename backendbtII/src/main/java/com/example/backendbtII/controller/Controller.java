package com.example.backendbtII.controller;

import com.example.backendbtII.entities.Airport;
import com.example.backendbtII.service.FlightOfferService;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.stream.Collectors;


@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("api/flights")
public class Controller {
    private final FlightOfferService flightOfferService;

    public Controller(FlightOfferService flightOfferService){
        this.flightOfferService= flightOfferService;
    }

    @GetMapping("/search")
    public Map<String, Object> searchFlights(
            @RequestParam String origin,
            @RequestParam String destination,
            @RequestParam String departureDate,
            @RequestParam String adults,
            @RequestParam (defaultValue = "false") boolean nonStop,
            @RequestParam (required = false) String returnDate,
            @RequestParam String currencyCode,
            @RequestParam(defaultValue = "price") String sortBy,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10")int size) {
        Map<String, Object> apiResponse= flightOfferService.getFlightOffers(
                origin, destination, departureDate, adults, nonStop, returnDate, currencyCode
        );
        List<Map<String, Object>> flights= (List<Map<String, Object>>) apiResponse.get("data");

        flights= sortFlights(flights, sortBy);

        List<Map<String, Object>> paginatedFlights = paginateFlights(flights, page, size);

        Map<String, Object> response= new HashMap<>();

        response.put("meta", Map.of(
                "totalResults", flights.size(),
                "totalPages", (int) Math.ceil((double) flights.size() / size),
                "currentPage", page
        ));
        response.put("data", paginatedFlights);
        response.put("dictionaries", apiResponse.get("dictionaries"));

        return response;
    }

    private List<Map<String,Object>> sortFlights(List<Map<String, Object>> flights, String sortBy) {
        if (flights == null || flights.isEmpty()){
            return flights;
        }

        Comparator<Map<String, Object>> comparator ;

        if("duration".equalsIgnoreCase(sortBy)){
            comparator = Comparator.comparing ( f -> getTotalDurationInMinutes((Map<String, Object>)((List<?>) f.get("itineraries")).get(0)));
        } else {
            comparator = Comparator.comparing(f -> Double.parseDouble(((Map<String, Object>) f.get("price")).get("total").toString()));
        }

        return flights.stream().sorted(comparator).collect(Collectors.toList());
    }

    private int getTotalDurationInMinutes(Map<String,Object> itinerary) {
        String durationStr = (String) itinerary.get("duration");

        try {
            return (int) Duration.parse(durationStr).toMinutes();

        }
        catch (DateTimeParseException e) {
            return Integer.MAX_VALUE;
        }
    }

    private List<Map<String, Object>> paginateFlights(List<Map<String,Object>> flights, int page, int size){
        int fromIndex= (page-1)*size;
        int toIndex= Math.min(fromIndex + size, flights.size());

        if (fromIndex >= flights.size()) {
            return Collections.emptyList();
        }

        return flights.subList(fromIndex, toIndex);
    }

    @GetMapping("/airports")
    public Map<String, Object> searchAirports(
            @RequestParam String keyword,
            @RequestParam String subType,
            @RequestParam int limit) {
        return flightOfferService.getAirports(keyword, subType, limit);
    }

    @GetMapping("fallback-airports")
    public List<Airport> searchFallbackAirports(
            @RequestParam String keyword, @RequestParam(defaultValue = "10") int limit
    ){
        return flightOfferService.searchFallbackAirports(keyword, limit);
    }
}
