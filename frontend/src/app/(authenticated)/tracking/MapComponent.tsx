"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip, useMap } from "react-leaflet";
import { Map as MapIcon, Satellite, Layers, CarFront, Moon, Sun } from "lucide-react";
import "leaflet/dist/leaflet.css";

interface MapComponentProps {
  fleet: any[];
  occurrences: Record<string, string>;
  selectedCar: string | null;
  onSelectCar: (id: string) => void;
  theme?: string;
}

type MapView = 'standard' | 'satellite' | 'hybrid';

// Componente helper para recarregar ou focar em carrinhos selecionados
function FocusMap({ selectedCar, fleet }: { selectedCar: string | null, fleet: any[] }) {
  const map = useMap();
  useEffect(() => {
    if (selectedCar) {
      const car = fleet.find(v => v.id === selectedCar);
      if (car && car.lat && car.lng) {
        map.setView([car.lat, car.lng], 15, { animate: true });
      }
    }
  }, [selectedCar, fleet, map]);
  return null;
}

export default function MapComponent({ fleet, occurrences, selectedCar, onSelectCar, theme }: MapComponentProps) {
  const mapRef = useRef<any>(null);
  const [mapView, setMapView] = useState<MapView | 'dark'>('standard');
  const [showTraffic, setShowTraffic] = useState(false);

  // Tile layers - Profissionais para Rastreamento
  const roadMapTile = "https://mt1.google.com/vt?lyrs=m&x={x}&y={y}&z={z}"; // Google Roadmap (Foco em Vias)
  const satelliteTile = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
  const hybridLabels = "https://mt1.google.com/vt?lyrs=h&x={x}&y={y}&z={z}"; // Google Labels (Híbrido)
  const trafficTile = "https://mt1.google.com/vt?lyrs=h@159000000,traffic|seconds_into_week:-1&style=3&x={x}&y={y}&z={z}";
  const darkTile = "https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png";

  useEffect(() => {
    delete (window as any).L?.Icon?.Default?.prototype?._getIconUrl;
  }, []);

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer
        center={[-15.7942, -47.8822]}
        zoom={5}
        style={{ height: "100%", width: "100%", backgroundColor: theme === 'dark' ? "#1a1a1a" : "#f1f5f9" }}
        ref={mapRef}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url={
            mapView === 'satellite' || mapView === 'hybrid' ? satelliteTile : 
            mapView === 'dark' ? darkTile : roadMapTile
          }
        />
        {mapView === 'hybrid' && (
          <TileLayer url={hybridLabels} opacity={0.9} />
        )}
        {showTraffic && (
          <TileLayer url={trafficTile} opacity={0.7} />
        )}

        <FocusMap selectedCar={selectedCar} fleet={fleet} />

        {fleet.map(v => {
          const hasNote = !!occurrences[v.id];
          const isMoving = parseInt(v.RASTVELOCIDADE) > 0;
          const color = hasNote ? '#ff9800' : (isMoving ? '#4caf50' : '#b2bec3');
          const isSelected = selectedCar === v.id;

          return (
            <CircleMarker
              key={v.id}
              center={[v.lat, v.lng]}
              radius={isSelected ? 10 : 7}
              pathOptions={{
                color: isSelected ? 'white' : 'transparent',
                fillColor: color,
                fillOpacity: 1,
                weight: 2
              }}
              eventHandlers={{
                click: () => onSelectCar(v.id)
              }}
            >
              <Tooltip 
                permanent 
                direction="top" 
                offset={[0, -5]} 
                opacity={0.9}
                className="custom-tooltip"
              >
                <div className="text-[10px] font-black text-black leading-none">{v.id}</div>
              </Tooltip>

              <Popup className="sn-popup">
                <div className="p-1 min-w-[160px]">
                  <div className="border-b border-gray-100 mb-2 pb-1 flex justify-between items-center">
                    <span className="text-lg font-black tracking-tighter text-gray-900 leading-none">#{v.id}</span>
                    <span className="text-[9px] font-black bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 uppercase">{v.VEICCATNOME}</span>
                  </div>
                  <div className="space-y-1.5 text-[11px]">
                    <p className="flex justify-between items-center">
                       <span className="text-gray-400 font-bold uppercase text-[9px]">Motorista</span>
                       <span className="text-blue-600 font-black uppercase text-right truncate ml-2 max-w-[100px]">{v.FUNCNOME || 'N.I'}</span>
                    </p>
                    <p className="flex justify-between items-center">
                       <span className="text-gray-400 font-bold uppercase text-[9px]">Velocidade</span>
                       <span className={`font-black ${isMoving ? 'text-green-600' : 'text-gray-900'}`}>{v.RASTVELOCIDADE} KM/H</span>
                    </p>
                    <p className="flex justify-between items-center">
                       <span className="text-gray-400 font-bold uppercase text-[9px]">Status</span>
                       <span className="font-black uppercase">{v.STATUS || 'OFFLINE'}</span>
                    </p>
                    <div className="pt-1 mt-1 border-t border-gray-50 text-[9px] text-gray-400 font-bold text-center italic uppercase tracking-tighter">
                       Atualizado as {v.RASTDATA?.split(' ')[1] || '--:--'}
                    </div>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Map View Controls - Moved to left to avoid detail panel conflict */}
      <div className="absolute top-6 left-6 flex flex-col gap-2 z-[1000]">
        <button 
          onClick={() => setMapView(mapView === 'dark' ? 'standard' : 'dark')}
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-xl group bg-[var(--card-bg)] text-[var(--foreground-muted)] hover:text-blue-500 hover:bg-[var(--secondary)]`}
          title={mapView === 'dark' ? "Ativar Modo Claro" : "Ativar Modo Escuro"}
        >
          {mapView === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          <span className="absolute left-14 bg-black/80 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none uppercase tracking-widest whitespace-nowrap">
            Trocar Tema
          </span>
        </button>

        <button 
          onClick={() => setMapView('satellite')}
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-xl group ${mapView === 'satellite' ? 'bg-blue-600 text-white' : 'bg-[var(--card-bg)] text-[var(--foreground-muted)] hover:text-blue-500 hover:bg-[var(--secondary)]'}`}
          title="Satélite"
        >
          <Satellite className="w-5 h-5" />
          <span className="absolute left-14 bg-black/80 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none uppercase tracking-widest">Satélite</span>
        </button>
        <button 
          onClick={() => setMapView('hybrid')}
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-xl group ${mapView === 'hybrid' ? 'bg-blue-600 text-white' : 'bg-[var(--card-bg)] text-[var(--foreground-muted)] hover:text-blue-500 hover:bg-[var(--secondary)]'}`}
          title="Híbrido"
        >
          <Layers className="w-5 h-5" />
          <span className="absolute left-14 bg-black/80 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none uppercase tracking-widest">Híbrido</span>
        </button>

        <div className="h-0.5 w-6 bg-[var(--border)] mx-auto opacity-50 my-1" />

        <button 
          onClick={() => setShowTraffic(!showTraffic)}
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-xl group ${showTraffic ? 'bg-amber-500 text-white' : 'bg-[var(--card-bg)] text-[var(--foreground-muted)] hover:text-amber-500 hover:bg-[var(--secondary)]'}`}
          title="Tráfego em Tempo Real"
        >
          <CarFront className="w-5 h-5" />
          <span className={`absolute left-14 bg-black/80 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none uppercase tracking-widest whitespace-nowrap`}>Trânsito: {showTraffic ? 'ON' : 'OFF'}</span>
        </button>
      </div>
    </div>
  );
}
