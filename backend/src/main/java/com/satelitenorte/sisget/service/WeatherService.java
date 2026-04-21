package com.satelitenorte.sisget.service;

import com.satelitenorte.sisget.dto.WeatherResponseDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Service
@RequiredArgsConstructor
@Slf4j
public class WeatherService {

    private final RestTemplate restTemplate;
    private static final String BASE_URL = "https://api.open-meteo.com/v1/forecast";

    @Cacheable(value = "weather", key = "#lat + '_' + #lon")
    public WeatherResponseDTO getCurrentWeather(Double lat, Double lon) {
        log.info("Buscando clima real para Lat: {}, Lon: {}", lat, lon);
        
        String url = UriComponentsBuilder.fromHttpUrl(BASE_URL)
                .queryParam("latitude", lat)
                .queryParam("longitude", lon)
                .queryParam("current", "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,is_day")
                .toUriString();

        try {
            return restTemplate.getForObject(url, WeatherResponseDTO.class);
        } catch (Exception e) {
            log.error("Erro ao buscar clima: {}", e.getMessage());
            return null;
        }
    }
}
