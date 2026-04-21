package com.satelitenorte.sisget.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeatherResponseDTO {
    
    private Double latitude;
    private Double longitude;
    
    @JsonProperty("current_weather")
    private WeatherCurrentDTO currentWeather;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WeatherCurrentDTO {
        private Double temperature;
        private Double windspeed;
        private Integer weathercode;
        @JsonProperty("is_day")
        private Integer isDay;
        private String time;
    }
}
