package com.satelitenorte.sisget.controller;

import com.satelitenorte.sisget.dto.WeatherResponseDTO;
import com.satelitenorte.sisget.service.WeatherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/weather")
@RequiredArgsConstructor
public class WeatherController {

    private final WeatherService weatherService;

    @GetMapping("/current")
    public ResponseEntity<WeatherResponseDTO> getCurrentWeather(
            @RequestParam(required = false, defaultValue = "-5.5262") Double lat,
            @RequestParam(required = false, defaultValue = "-47.4731") Double lon) {
        
        WeatherResponseDTO weather = weatherService.getCurrentWeather(lat, lon);
        if (weather != null) {
            return ResponseEntity.ok(weather);
        }
        return ResponseEntity.internalServerError().build();
    }
}
