package com.example.backendbtII.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Map;


@Service
public class FlightOfferService {
    private final RestTemplate restTemplate;
    private final String apiKey;
    private final String apiSecret;
    private final String tokenUrl;
    private final String baseUrl;
    private String accessToken;

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
        throw new RuntimeException("Failed to fetch auth token");
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

        ResponseEntity<Map> response = restTemplate.exchange(newUrl.toString(), HttpMethod.GET, requestEntity, Map.class);
        if (response.getStatusCode()== HttpStatus.OK){
            return response.getBody();
        }
        throw new RuntimeException("Failed to fetch auth token");
    }
    public Map<String, Object> getAirports(String keyword, String subType, int limit) {
        HttpHeaders headers= new HttpHeaders();
        headers.setBearerAuth(accessToken);
        HttpEntity<String> requestEntity= new HttpEntity<>(headers);
        String url = baseUrl+"v1/reference-data/locations?subType="+subType+"&keyword="
                +keyword
                + "&page[limit]="+limit+"&page[offset]=0&sort=analytics.travelers.score&view=FULL";
        ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, requestEntity, Map.class);
        if (response.getStatusCode()== HttpStatus.OK){
            return response.getBody();
        }
        throw new RuntimeException("Failed to fetch auth token");
    }
}
