"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip, useMap, useMapEvents } from "react-leaflet";
import { Map as MapIcon, Satellite, Layers, CarFront, Moon, Sun, CloudMoon, Maximize, Minimize, LocateFixed, CloudSun, CloudFog } from "lucide-react";
import OpenWeatherMapLayer from "./OpenWeatherMapLayer";
import "leaflet/dist/leaflet.css";
import { toast } from "sonner";

interface MapComponentProps {
  fleet: any[];
  occurrences: Record<string, string>;
  selectedCar: string | null;
  onSelectCar: (id: string) => void;
  theme?: string;
  customFocus?: [number, number] | null;
  lockFocus?: boolean;
  onToggleFullscreen?: () => void;
  externalFullscreenState?: boolean;
  isSidebarOpen?: boolean;
}

type MapView = 'standard' | 'satellite' | 'hybrid';

// Componente helper para recarregar ou focar em carrinhos selecionados ou pontos customizados
function FocusMap({ selectedCar, fleet, customFocus, lockFocus }: { selectedCar: string | null, fleet: any[], customFocus?: [number, number] | null, lockFocus?: boolean }) {
  const map = useMap();
  
  useEffect(() => {
    try {
      if (!map) return;
      
      if (customFocus) {
        map.flyTo(customFocus, 13, { duration: 1.5 });
      } else if (selectedCar && lockFocus) {
        const car = fleet.find(v => v.id === selectedCar);
        if (car && car.lat && car.lng) {
          map.flyTo([car.lat, car.lng], 15, { duration: 1.5 });
          setTimeout(() => {
              if (map) map.invalidateSize();
          }, 600);
        }
      }
    } catch (e) {
        console.warn("[MAP] Falha ao mover câmera: Mapa ainda não inicializado corretamente.");
    }
  }, [selectedCar, fleet, customFocus, map, lockFocus]);
  
  return null;
}

export default function MapComponent({ 
  fleet, 
  occurrences, 
  selectedCar, 
  onSelectCar, 
  theme, 
  customFocus, 
  lockFocus, 
  onToggleFullscreen, 
  externalFullscreenState,
  isSidebarOpen 
}: MapComponentProps) {
  const mapRef = useRef<any>(null);
  const [mapView, setMapView] = useState<MapView | 'dark'>('standard');
  const [showTraffic, setShowTraffic] = useState(false);
  const [weatherMode, setWeatherMode] = useState<'off' | 'clouds' | 'precipitation'>('off');
  const [timeLeft, setTimeLeft] = useState(120);
  const [centerClickCount, setCenterClickCount] = useState(0);

  // Lógica de Temporizador para Proteção de Cota (OWM)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (weatherMode !== 'off') {
      // Reinicia o tempo ao trocar de modo
      setTimeLeft(120);
      
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setWeatherMode('off');
            toast.warning("Radar pausado para economizar sua cota de dados.");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [weatherMode]);

  // Re-validar tamanho do mapa quando a sidebar mudar
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapRef.current) mapRef.current.invalidateSize();
    }, 550); // Ligeiramente após o término da animação de 500ms
    return () => clearTimeout(timer);
  }, [isSidebarOpen]);

  // Tile layers - Profissionais para Rastreamento
  const roadMapTile = "https://{s}.tile.openstreetmap.de/{z}/{x}/{y}.png"; // OpenStreetMap.DE (Foco em Vias)
  const satelliteTile = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
  const hybridLabels = "https://mt1.google.com/vt?lyrs=h&x={x}&y={y}&z={z}"; // Google Labels (Híbrido - Mantido para legibilidade)
  const trafficTile = "https://mt1.google.com/vt?lyrs=h@159000000,traffic|seconds_into_week:-1&style=3&x={x}&y={y}&z={z}";

  useEffect(() => {
    delete (window as any).L?.Icon?.Default?.prototype?._getIconUrl;
  }, []);

  const toggleFullscreen = () => {
     if (onToggleFullscreen) {
        onToggleFullscreen();
     }
  };

  // Helper para detectar movimento manual do usuário no mapa e resetar o ciclo de foco
  const MapEvents = () => {
    useMapEvents({
      dragstart: () => setCenterClickCount(0),
      zoomstart: () => setCenterClickCount(0)
    });
    return null;
  };

  const handleCenterAction = () => {
     const map = mapRef.current;
     if (!map) return;

     if (centerClickCount === 0) {
        // Passo 1: Focar na visão global (Frota)
        map.flyTo([-15.7942, -47.8822], 5, { duration: 1.5 });
        toast.info("Mapa centralizado na visão global");
        setCenterClickCount(1);
     } else {
        // Passo 2: Focar no Dispositivo (GPS) - Mantém estado 1 para permitir refresh contínuo
        if (!navigator.geolocation) {
           toast.error("Geolocalização não suportada no seu navegador");
           return;
        }
        
        toast.promise(
          new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                map.flyTo([pos.coords.latitude, pos.coords.longitude], 13, { duration: 2 });
                resolve(true);
              },
              (err) => reject(err),
              { enableHighAccuracy: true, timeout: 5000, maximumAge: 30000 }
            );
          }),
          {
            loading: 'Localizando seu dispositivo...',
            success: 'Localização atualizada!',
            error: 'Serviço de localização lento ou indisponível.'
          }
        );
     }
  };

  return (
    <div className={`w-full h-full relative z-0 ${mapView === 'dark' ? 'night-mode' : ''}`}>
      <MapContainer
        center={[-15.7942, -47.8822]}
        zoom={5}
        style={{ height: "100%", width: "100%", backgroundColor: theme === 'dark' ? "#1a1a1a" : "#f1f5f9" }}
        ref={mapRef}
        zoomControl={false}
        attributionControl={false}
        preferCanvas={true}
      >
        <TileLayer
          url={mapView === 'satellite' || mapView === 'hybrid' ? satelliteTile : roadMapTile}
          eventHandlers={{
            tileerror: () => {
              toast.error("Erro ao carregar blocos do mapa. Tente alternar o estilo (Satélite/Padrão) ou verifique sua conexão.", {
                id: 'tile-error' // Evita spam de toasts se muitos tiles falharem
              });
            }
          }}
        />
        {mapView === 'hybrid' && (
          <TileLayer url={hybridLabels} opacity={0.9} />
        )}
        {showTraffic && (
          <TileLayer url={trafficTile} opacity={0.7} />
        )}
        {weatherMode !== 'off' && (
          <OpenWeatherMapLayer layer={weatherMode === 'clouds' ? 'clouds_new' : 'precipitation_new'} />
        )}

        <FocusMap selectedCar={selectedCar} fleet={fleet} customFocus={customFocus} lockFocus={lockFocus} />
        <MapEvents />

        {fleet.map(v => {
          const hasNote = !!occurrences[v.id];
          const isMoving = parseInt(v.RASTVELOCIDADE) > 0;
          const color = hasNote ? '#ff9800' : (isMoving ? '#4caf50' : '#b2bec3');
          const isSelected = selectedCar === v.id;

          return (
            <CircleMarker
              key={`car-${v.id}-${isSelected}`}
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
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-xl group bg-[var(--card-bg)] text-[var(--foreground-muted)] hover:text-blue-500 hover:bg-[var(--secondary)] ${mapView === 'dark' ? 'ring-2 ring-blue-500' : ''}`}
          title={mapView === 'dark' ? "Desativar Modo Noturno" : "Ativar Modo Noturno"}
        >
          {mapView === 'dark' ? <CloudMoon className="w-5 h-5 text-blue-500" /> : <Moon className="w-5 h-5" />}
          <span className="absolute left-14 bg-black/80 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none uppercase tracking-widest whitespace-nowrap">
            Modo Noturno: {mapView === 'dark' ? 'ON' : 'OFF'}
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



        <div className="relative group">
          {/* Progress Border SVG (Rounded Rect) */}
          {weatherMode !== 'off' && (
            <svg className="absolute -inset-1 w-[56px] h-[56px] pointer-events-none z-[1001]">
              <rect
                x="4"
                y="4"
                width="48"
                height="48"
                rx="12"
                ry="12"
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                className={weatherMode === 'clouds' ? 'text-indigo-600/30' : 'text-blue-500/30'}
              />
              <rect
                x="4"
                y="4"
                width="48"
                height="48"
                rx="12"
                ry="12"
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                strokeLinecap="round"
                className={weatherMode === 'clouds' ? 'text-indigo-400' : 'text-blue-300'}
                style={{
                  strokeDasharray: 172,
                  // Começa em 0 (full) e vai até 172 (empty) conforme o tempo acaba
                  strokeDashoffset: 172 * (1 - timeLeft / 120),
                  transition: 'stroke-dashoffset 1s linear'
                }}
              />
            </svg>
          )}

          <button 
            onClick={() => {
              if (weatherMode === 'off') setWeatherMode('clouds');
              else if (weatherMode === 'clouds') setWeatherMode('precipitation');
              else setWeatherMode('off');
            }}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-xl relative z-[1002]
              ${weatherMode === 'clouds' ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)]' : 
                weatherMode === 'precipitation' ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 
                'bg-[var(--card-bg)] text-[var(--foreground-muted)] hover:text-indigo-500 hover:bg-[var(--secondary)]'}`}
            title={weatherMode === 'off' ? "Ver Nuvens" : weatherMode === 'clouds' ? "Ver Chuva" : "Desativar Clima"}
          >
            {weatherMode === 'precipitation' ? <CloudSun className="w-5 h-5" /> : <CloudFog className="w-5 h-5" />}
            <span className={`absolute left-14 bg-black/80 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none uppercase tracking-widest whitespace-nowrap`}>
              Clima: {weatherMode === 'off' ? 'OFF' : weatherMode === 'clouds' ? 'NUVENS' : 'CHUVA'} ({timeLeft}s)
            </span>
          </button>
        </div>

        <button 
          onClick={toggleFullscreen}
          className="w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-xl group bg-[var(--card-bg)] text-[var(--foreground-muted)] hover:text-blue-500 hover:bg-[var(--secondary)]"
          title={externalFullscreenState ? "Sair da Tela Cheia" : "Tela Cheia"}
        >
          {externalFullscreenState ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          <span className="absolute left-14 bg-black/80 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none uppercase tracking-widest">
            {externalFullscreenState ? 'Recolher' : 'Tela Cheia'}
          </span>
        </button>

        <button 
          onClick={handleCenterAction}
          className="w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-xl group bg-[var(--card-bg)] text-[var(--foreground-muted)] hover:text-emerald-500 hover:bg-[var(--secondary)]"
          title="Centralizar Mapa"
        >
          <LocateFixed className={`w-5 h-5 ${centerClickCount === 1 ? 'text-emerald-500' : ''}`} />
          <span className="absolute left-14 bg-black/80 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none uppercase tracking-widest">
            {centerClickCount === 0 ? 'Focar Frota' : 'Focar Meu Local'}
          </span>
        </button>
      </div>
    </div>
  );
}
