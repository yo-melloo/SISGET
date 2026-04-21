package com.satelitenorte.sisget.service;

import org.springframework.stereotype.Service;

@Service
public class ETACalculatorService {

    // Coordenadas fornecidas: 5°29'27.1"S 47°28'07.9"W
    // DMS to Decimal: -(5 + 29/60 + 27.1/3600) = -5.490861, -(47 + 28/60 + 7.9/3600) = -47.468861
    private static final double ITZ_LAT = -5.490861;
    private static final double ITZ_LON = -47.468861;
    private static final double EARTH_RADIUS_KM = 6371.0;
    
    // Fator de correção rodoviário (curvas + topografia + paradas operacionais)
    // Aumentado para 1.35 para refletir maior realismo em rotas de ônibus
    private static final double ROAD_FACTOR = 1.35;
    
    // Minutos adicionais fixos para paradas operacionais se a distância > 100km
    private static final int STOP_OVERHEAD_MINS = 40;

    public double calculateDistance(double lat1, double lon1) {
        double dLat = Math.toRadians(ITZ_LAT - lat1);
        double dLon = Math.toRadians(ITZ_LON - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(ITZ_LAT))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_KM * c;
    }

    public long estimateTravelTime(double distanceKm, Double currentSpeed) {
        // Velocidade operacional média se o veículo estiver parado ou muito lento
        double effectiveSpeed = (currentSpeed == null || currentSpeed < 10.0) ? 60.0 : currentSpeed;
        
        // Cap de velocidade para manter realismo (ônibus dificilmente mantém média > 85km/h em trechos longos)
        effectiveSpeed = Math.min(effectiveSpeed, 85.0);

        // Distância rodoviária estimada
        double roadDistance = distanceKm * ROAD_FACTOR;
        
        // Tempo base em minutos
        double timeMins = (roadDistance / effectiveSpeed) * 60.0;
        
        // Adiciona overhead de paradas se for trecho longo
        if (roadDistance > 100) {
            timeMins += STOP_OVERHEAD_MINS;
        }

        return Math.round(timeMins);
    }
}
