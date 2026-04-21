"use client";

import { TileLayer } from "react-leaflet";

export default function NasaSatelliteLayer() {
  // NASA GIBS WMTS Endpoint para GOES-East GeoColor (Melhor para Américas)
  // O modo 'default' sempre busca a data mais recente disponível.
  // NASA GIBS WMTS - A camada 'GOES-East_ABI_GeoColor' no EPSG:3857 usa especificamente o set 'GoogleMapsCompatible_Level7'
  const nasaUrl = "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/wmts.cgi?" + 
    "Service=WMTS&Request=GetTile&Version=1.0.0&Layer=GOES-East_ABI_GeoColor&Style=default" +
    "&TileMatrixSet=GoogleMapsCompatible_Level7&TileMatrix={z}&TileRow={y}&TileCol={x}&Format=image/png";

  return (
    <TileLayer
      url={nasaUrl}
      attribution='&copy; <a href="https://earthdata.nasa.gov/gibs">NASA GIBS</a>'
      opacity={0.8}
      zIndex={90}
      bounds={[[-85, -180], [85, 180]]}
      maxNativeZoom={7} // O satélite GOES GeoColor no GIBS/EPSG:3857 só vai até o nível 7. 
      minZoom={0}
    />
  );
}
