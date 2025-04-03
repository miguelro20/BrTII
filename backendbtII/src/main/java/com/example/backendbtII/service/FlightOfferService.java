package com.example.backendbtII.service;

import com.example.backendbtII.entities.Airport;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.io.IOError;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;


@Service
public class FlightOfferService {
    private final RestTemplate restTemplate;
    private final String apiKey;
    private final String apiSecret;
    private final String tokenUrl;
    private final String baseUrl;
    private String accessToken;
    private List<Airport> fallbackAirports;

    public FlightOfferService(RestTemplate restTemplate,
                              @Value("${amadeus.api.key}") String apiKey,
                              @Value("${amadeus.api.secret}") String apiSecret,
                              @Value("${amadeus.api.token.url}") String tokenUrl,
                              @Value("${amadeus.api.base.url}") String baseUrl) {
        this.restTemplate= restTemplate;
        this.apiKey= apiKey;
        this.apiSecret= apiSecret;
        this.tokenUrl= tokenUrl;
        this.baseUrl= baseUrl;
        this.accessToken= fetchAccessToken();
    }

    @PostConstruct
    public void loadFallbackAirports() {
        ObjectMapper objectMapper = new ObjectMapper();
        try (InputStream inputStream = getClass().getClassLoader().getResourceAsStream("cleaned_airports.json")) {
            if (inputStream != null) {
                Map<String,Map<String, String>> airportMap = objectMapper.readValue(inputStream, new TypeReference<>() {});
                this.fallbackAirports = airportMap.entrySet().stream().map(entry -> new Airport(entry.getKey(), entry.getValue().get("name"), entry.getValue().get("state")))
                        .toList();
            } else {
                this.fallbackAirports = new ArrayList<>();
            }
        }
        catch (IOException e) {
                e.printStackTrace();
                this.fallbackAirports = new ArrayList<>();
        }
    }
    private String fetchAccessToken() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        MultiValueMap<String, String> requestBody = new LinkedMultiValueMap<>();
        requestBody.add("grant_type", "client_credentials");
        requestBody.add("client_id", apiKey);
        requestBody.add("client_secret", apiSecret);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(requestBody,headers);

        ResponseEntity<Map> response = restTemplate.exchange(tokenUrl, HttpMethod.POST, request, Map.class);
        if (response.getStatusCode()== HttpStatus.OK){
            return (String) response.getBody().get("access_token");
        }
        return "";
    }
    public Map<String, Object> getFlightOffers(String origin, String destination, String departureDate, String adults, boolean nonStop, String returnDate, String currencyCode) {
        HttpHeaders headers= new HttpHeaders();
        headers.setBearerAuth(accessToken);
        HttpEntity<String> requestEntity= new HttpEntity<>(headers);
        StringBuilder newUrl= new StringBuilder();
        newUrl.append(baseUrl);
        newUrl.append("v2/shopping/flight-offers?originLocationCode=");
        newUrl.append(origin);
        newUrl.append("&destinationLocationCode=");
        newUrl.append(destination);
        newUrl.append("&departureDate=");
        newUrl.append(departureDate);
        newUrl.append("&adults=");
        newUrl.append(adults);
        newUrl.append("&currencyCode="+currencyCode);

        if (nonStop) {
            newUrl.append("&nonStop=true");
        }
        if (returnDate!=null && !returnDate.isEmpty()){
            newUrl.append("&returnDate="+returnDate);
        }
        try{
        ResponseEntity<Map> response = restTemplate.exchange(newUrl.toString(), HttpMethod.GET, requestEntity, Map.class);
        if (response.getStatusCode()== HttpStatus.OK){
            return response.getBody();
        }
        }catch (Exception e) {
            return loadMockFlights();
        }
        throw new RuntimeException("Failed to fetch flight offers");
    }

    private Map<String, Object> loadMockFlights() {
        ObjectMapper objectMapper = new ObjectMapper();
        try (InputStream inputStream = getClass().getClassLoader().getResourceAsStream("mock_flights.json")) {
            if (inputStream != null){
                return objectMapper.readValue(inputStream, new TypeReference<Map<String, Object>>() {});
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        return Map.of("data", List.of(), "dictionaries", Map.of());
    }

    public Map<String, Object> getAirports(String keyword, String subType, int limit) {
        HttpHeaders headers= new HttpHeaders();
        headers.setBearerAuth(accessToken);
        HttpEntity<String> requestEntity= new HttpEntity<>(headers);
        String url = baseUrl+"v1/reference-data/locations?subType="+subType+"&keyword="
                +keyword
                + "&page[limit]="+limit+"&page[offset]=0&sort=analytics.travelers.score&view=FULL";
        try{        ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, requestEntity, Map.class);
            if (response.getStatusCode()== HttpStatus.OK){
                return response.getBody();
            }

        }       catch (Exception e) {
            return Map.of("data", searchFallbackAirports(keyword, limit));
        }

        throw new RuntimeException("Failed to fetch auth token");
    }

    public List<Airport> searchFallbackAirports(String keyword, int limit) {
        return fallbackAirports.stream()
                .filter(a -> a.getName().toLowerCase().contains(keyword.toLowerCase()) ||
                        a.getState().toLowerCase().contains(keyword.toLowerCase()) ||
                        a.getIataCode().toLowerCase().contains(keyword.toLowerCase()))
                                .limit(limit)
                                .collect(Collectors.toList());
    }
}
