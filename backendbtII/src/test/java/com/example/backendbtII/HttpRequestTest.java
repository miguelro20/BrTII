package com.example.backendbtII;


import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class HttpRequestTest {
    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void testGetIataCode() throws Exception {
        assertThat(this.restTemplate.getForObject("http://localhost:" + port + "/api/flights/fallback-airports?keyword=CUU&subType=AIRPORT,CITY&limit=1",
                String.class)).contains("CUU");
    }
    @Test
    void testGetFlightsResponse() throws Exception {
        assertThat(this.restTemplate.getForObject("http://localhost:" + port + "/api/flights/search?origin=CUU&destination=MTY&departureDate=2025-04-05&adults=1&currencyCode=USD&nonStop=&returnDate=2025-05-02&sortBy=price&page=1&size=10",
                String.class)).contains("data");
    }
}
