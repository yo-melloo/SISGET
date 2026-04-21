"use client";

import { TileLayer } from "react-leaflet";

interface OpenWeatherMapLayerProps {
  layer: "clouds_new" | "precipitation_new";
}

export default function OpenWeatherMapLayer({ layer }: OpenWeatherMapLayerProps) {
  const apiKey = process.env.NEXT_PUBLIC_OWM_KEY;
  
  if (!apiKey) {
    console.error("[OWM] Chave de API não encontrada no ambiente.");
    return null;
  }

  // Camada de Clima em Tempo Real (OpenWeatherMap)
  const owmUrl = `https://tile.openweathermap.org/map/${layer}/{z}/{x}/{y}.png?appid=${apiKey}`;

  return (
    <TileLayer
      key={layer} // Força o refresh da camada ao trocar o tipo
      url={owmUrl}
      attribution='&copy; <a href="https://openweathermap.org">OpenWeatherMap</a>'
      opacity={0.8} // Aumentado conforme solicitado
      zIndex={95}
      maxNativeZoom={19}
      updateWhenIdle={true} // SÓ pede tiles novos quando você para de mover o mapa
      updateInterval={500} // Debounce de 500ms para evitar spam
    />
  );
}
