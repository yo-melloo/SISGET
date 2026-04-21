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
    
    @JsonProperty("current")
    private WeatherCurrentDTO current;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WeatherCurrentDTO {
        @JsonProperty("temperature_2m")
        private Double temperature;
        
        @JsonProperty("wind_speed_10m")
        private Double windspeed;
        
        @JsonProperty("weather_code")
        private Integer weathercode;
        
        @JsonProperty("relative_humidity_2m")
        private Integer humidity;
        
        @JsonProperty("is_day")
        private Integer isDay;
        
        private String time;
    }
}
