"use client";

import { useEffect, useState } from "react";
import { TileLayer } from "react-leaflet";

export default function RainViewerLayer() {
  const [path, setPath] = useState<string | null>(null);

  useEffect(() => {
    // Busca o path mais recente do radar
    fetch("https://api.rainviewer.com/public/weather-maps.json")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.radar && data.radar.past && data.radar.past.length > 0) {
          // Pega o último frame (mais recente)
          const latest = data.radar.past[data.radar.past.length - 1];
          setPath(latest.path);
        }
      })
      .catch((err) => console.error("Erro ao carregar RainViewer:", err));
  }, []);

  if (!path) return null;

  // O RainViewer fornece o path completo (ex: /v2/radar/hash)
  return (
    <TileLayer
      url={`https://tilecache.rainviewer.com${path}/256/{z}/{x}/{y}/2/1_1.png`}
      opacity={0.6}
      zIndex={100}
    />
  );
}
