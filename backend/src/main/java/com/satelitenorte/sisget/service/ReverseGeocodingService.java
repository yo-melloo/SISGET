package com.satelitenorte.sisget.service;

import com.satelitenorte.sisget.repository.FleetCurrentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReverseGeocodingService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final FleetCurrentRepository currentRepository;

    private static final String NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lon}&zoom=10&addressdetails=1";

    @Cacheable(value = "city-locations", key = "#lat.toString() + ',' + #lon.toString()")
    public String getCityFromCoords(Double lat, Double lon) {
        if (lat == null || lon == null) return "Local Indeterminado";
        
        int attempts = 0;
        while (attempts < 2) {
            try {
                String url = NOMINATIM_URL
                        .replace("{lat}", String.valueOf(lat))
                        .replace("{lon}", String.valueOf(lon));
                
                log.info("[GEO] Consultando: {}", url);

                org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
                headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) SISGET-App");
                headers.set("Accept-Language", "pt-BR,pt;q=0.9");
                org.springframework.http.HttpEntity<String> entity = new org.springframework.http.HttpEntity<>(headers);

                org.springframework.http.ResponseEntity<Map> responseEntity = restTemplate.exchange(
                        url, 
                        org.springframework.http.HttpMethod.GET, 
                        entity, 
                        Map.class
                );
                
                Map<String, Object> response = responseEntity.getBody();
                
                if (response != null && response.containsKey("address")) {
                    Map<String, Object> address = (Map<String, Object>) response.get("address");
                    
                    String[] cityKeys = {"city", "town", "village", "municipality", "county", "road", "hamlet", "suburb", "state_district"};
                    for (String key : cityKeys) {
                        if (address.get(key) != null) {
                            return (String) address.get(key);
                        }
                    }
                }
                break; // Sucesso ou resposta sem endereço
            } catch (org.springframework.web.client.HttpClientErrorException.TooManyRequests e) {
                attempts++;
                log.warn("[GEO] Nominatim 429. Tentativa {}/2. Aguardando...", attempts);
                try { Thread.sleep(1500); } catch (InterruptedException ie) { Thread.currentThread().interrupt(); }
            } catch (Exception e) {
                log.error("[GEO] Erro na consulta Nominatim ({},{}): {}", lat, lon, e.getMessage());
                break;
            }
        }
        return "Local Indeterminado";
    }

    public void saveCityLocation(String vehicleId, String city) {
        if (city != null && !city.equals("Local Indeterminado")) {
           currentRepository.updateCityLocation(vehicleId, city);
        }
    }
}
