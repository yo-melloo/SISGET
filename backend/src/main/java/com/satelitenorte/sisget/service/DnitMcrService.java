package com.satelitenorte.sisget.service;

import com.satelitenorte.sisget.repository.FleetCurrentRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DnitMcrService {

    private static final Logger log = LoggerFactory.getLogger(DnitMcrService.class);
    private final RestTemplate restTemplate = new RestTemplate();
    private final FleetCurrentRepository currentRepository;
    
    // DNIT GeoServer WFS: Busca por interseção com buffer de 0.005 (~500 metros)
    private static final String DNIT_WFS_URL = "https://servicos.dnit.gov.br/dnitgeo/geoserver/vgeo/ows" +
            "?service=WFS&version=1.0.0&request=GetFeature&typeName=vgeo:vw_snv_rod" +
            "&maxFeatures=1&outputFormat=application/json" +
            "&cql_filter=INTERSECTS(geom,buffer(POINT({lon} {lat}),0.005))";

    @Async
    public void enrichAndSaveMcr(String vehicleId, Double lat, Double lon) {
        if (lat == null || lon == null) return;
        
        try {
            String mcr = getHighwayLocation(lat, lon);
            
            if (mcr != null) {
                currentRepository.updateMcrLocation(vehicleId, mcr);
                log.info("[MCR-OK] {} -> {}", vehicleId, mcr);
            }
        } catch (Exception e) {
            log.error("[MCR] Erro no enriquecimento para {}: {}", vehicleId, e.getMessage());
        }
    }

    @Cacheable(value = "mcr-locations", key = "{#lat, #lon}")
    public String getHighwayLocation(Double lat, Double lon) {
        try {
            // WKT/CQL exige Longitude primeiro
            String url = DNIT_WFS_URL
                    .replace("{lon}", String.valueOf(lon))
                    .replace("{lat}", String.valueOf(lat));

            log.debug("[MCR] Consultando GeoServer DNIT...");
            
            // Usamos String.class primeiro para evitar erros de deserialização complexa se houver erro XML
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            
            if (response != null && response.containsKey("features")) {
                List<Map<String, Object>> features = (List<Map<String, Object>>) response.get("features");
                
                if (!features.isEmpty()) {
                    Map<String, Object> props = (Map<String, Object>) features.get(0).get("properties");
                    
                    if (props != null) {
                        // Mapeamento CamelCase confirmado na auditoria de 6 passos
                        Object brObj = props.getOrDefault("Codigo_BR", props.get("Codigo_SNV"));
                        Object kmObj = props.getOrDefault("Quilometragem_Inicio", props.get("vl_km"));
                        Object ufObj = props.getOrDefault("Unidade_Federacao", "BR");

                        if (brObj != null) {
                            String br = String.valueOf(brObj).toUpperCase().replace("BR-", "").trim();
                            String km = kmObj != null ? String.valueOf(kmObj) : "0";
                            String uf = String.valueOf(ufObj);
                            
                            // Formato final exibido na UI
                            return String.format("BR-%s/%s KM %s", br, uf, km);
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.warn("[MCR] Falha na consulta DNIT ({},{}): {}", lat, lon, e.getMessage());
        }
        return "FORA DE ÁREA FEDERAL";
    }
}
