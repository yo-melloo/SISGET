"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { Search, Loader2, X, RefreshCw, Bell, MapPin, LocateFixed, ChevronLeft, ChevronRight, CloudSun, Cloud, CloudRain, CloudLightning, Sun, CloudFog } from "lucide-react";
import { useTheme } from "next-themes";
import { useMemo, useRef } from "react";
import { toast } from "sonner";
import MultiSelectCombobox, { FilterOption } from "./MultiSelectCombobox";

// Disable SSR for React-Leaflet
const MapComponent = dynamic(() => import("./MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full w-full bg-[var(--background)] flex-col gap-4">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      <span className="text-muted text-xs font-bold uppercase tracking-widest">Carregando Mapas...</span>
    </div>
  )
});

interface FleetVehicle {
  id: string;
  lat: number;
  lng: number;
  VEICPLACA: string;
  RASTVELOCIDADE: string;
  FUNCNOME?: string;
  ROTANOME?: string;
  AREANOME?: string;
  STATUS?: string;
  RASTDATA?: string;
  VEICODOMETRO?: string;
  MED_VALOR?: string;
  VEICCATNOME?: string;
  RASTGIRO?: string;
  dnitMcr?: string;
}

export default function TrackingPage() {
  const [fleet, setFleet] = useState<FleetVehicle[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCar, setSelectedCar] = useState<string | null>(null);
  const [occurrences, setOccurrences] = useState<Record<string, string>>({});
  const [onlyOccurrences, setOnlyOccurrences] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [customFocus, setCustomFocus] = useState<[number, number] | null>(null);
  const [lastSync, setLastSync] = useState<string>("--:--:--");
  const [showStreetView, setShowStreetView] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<Set<string>>(new Set());
  const [lockFocus, setLockFocus] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [vehicleWeather, setVehicleWeather] = useState<{ temp: number; description: string; icon: any } | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);

  const weatherMap: Record<number, { desc: string; icon: any }> = {
    0: { desc: "Céu limpo", icon: Sun },
    1: { desc: "Principalmente limpo", icon: Sun },
    2: { desc: "Parcialmente nublado", icon: CloudSun },
    3: { desc: "Nublado", icon: Cloud },
    45: { desc: "Nevoeiro", icon: CloudFog },
    48: { desc: "Nevoeiro rime", icon: CloudFog },
    51: { desc: "Garoa leve", icon: CloudRain },
    53: { desc: "Garoa moderada", icon: CloudRain },
    55: { desc: "Garoa densa", icon: CloudRain },
    61: { desc: "Chuva leve", icon: CloudRain },
    63: { desc: "Chuva moderada", icon: CloudRain },
    65: { desc: "Chuva forte", icon: CloudRain },
    80: { desc: "Pancadas de chuva leves", icon: CloudRain },
    81: { desc: "Pancadas de chuva moderadas", icon: CloudRain },
    82: { desc: "Pancadas de chuva violentas", icon: CloudRain },
    95: { desc: "Trovoada", icon: CloudLightning },
    96: { desc: "Trovoada com granizo leve", icon: CloudLightning },
    99: { desc: "Trovoada com granizo forte", icon: CloudLightning },
  };

  const BACKEND_URL = typeof window !== "undefined" 
    ? `http://${window.location.hostname}:8080` 
    : "http://localhost:8080"; 

  // Persistência de Filtros: Carregamento Inicial
  useEffect(() => {
    const saved = localStorage.getItem('sisget_tracking_filters');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSelectedFilters(new Set(parsed));
          setTimeout(() => {
            toast.success("Sessão Restaurada", { 
              description: "Continuando de onde você parou.",
              icon: "🔄"
            });
          }, 1000);
        }
      } catch (e) {
        console.error("[STORAGE] Erro ao restaurar filtros:", e);
      }
    }
  }, []);

  // Persistência de Filtros: Salvamento Automático
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('sisget_tracking_filters', JSON.stringify(Array.from(selectedFilters)));
    }
  }, [selectedFilters, mounted]);

  const fetchSyncInfo = async () => {
    try {
      const token = localStorage.getItem("sisget_token");
      const res = await fetch(`${BACKEND_URL}/api/fleet/sync-info`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.lastSync) setLastSync(data.lastSync);
        if (data.autoActive !== undefined) setAutoRefresh(data.autoActive);
      }
    } catch (e) {
      console.error("[SYNC] Falha ao obter info de sincronia:", e);
    }
  };

  const loadFleet = async () => {
    try {
      const token = localStorage.getItem("sisget_token");
      const res = await fetch(`${BACKEND_URL}/api/fleet/latest`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const body = await res.json();
        
        const fleetData = body.fleet || [];
        if (body.lastSync) setLastSync(body.lastSync);

        const parsed = fleetData.map((v: any) => ({
          id: v.vehicleId,
          lat: v.latitude,
          lng: v.longitude,
          VEICPLACA: v.plate,
          RASTVELOCIDADE: String(v.speed),
          FUNCNOME: v.driverName,
          ROTANOME: v.routeName,
          AREANOME: v.areaName,
          STATUS: v.status,
          RASTDATA: v.transmissionDate,
          VEICODOMETRO: v.odometer,
          MED_VALOR: v.fuelLevel,
          VEICCATNOME: v.category,
          RASTGIRO: v.rpm,
          dnitMcr: v.dnitMcr
        })).filter((v: FleetVehicle) => !isNaN(v.lat) && !isNaN(v.lng));
        setFleet(parsed);
      }
    } catch (e) {
      console.error("Erro ao carregar frota do backend:", e);
    }
  };

  const handleToggleAuto = async () => {
    const newState = !autoRefresh;
    try {
      const token = localStorage.getItem("sisget_token");
      const res = await fetch(`${BACKEND_URL}/api/fleet/toggle-auto`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ active: newState })
      });
      if (res.ok) {
        setAutoRefresh(newState);
        toast.info(newState ? "Automação Ativada" : "Automação Pausada", {
          description: newState ? "O sistema sincronizará a frota periodicamente." : "Sincronização automática desativada."
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchOccurrences = async () => {
    try {
      const token = localStorage.getItem("sisget_token");
      const res = await fetch("/api/fleet/occurrences", {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const occs: Record<string, string> = {};
        data.forEach((item: any) => {
          occs[item.vehicleId] = item.occurrenceText;
        });
        setOccurrences(occs);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
        const start = Date.now();
        const token = localStorage.getItem("sisget_token");
        const res = await fetch("/api/fleet/refresh", { 
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
          const result = await res.json();
          const duration = ((Date.now() - start) / 1000).toFixed(1);
          console.log(`[REFRESH] Bot finalizado em ${duration}s:`, result);
          
          await loadFleet();
          await fetchSyncInfo();
          await fetchOccurrences();
          toast.success("Frota Sincronizada", { description: `Dados atualizados em ${duration}s.` });
        } else {
          toast.error("Falha no Comando", { description: "O servidor recusou a requisição de refresh." });
        }
    } catch (e) {
      console.error("[REFRESH] Erro durante o processo:", e);
      toast.error("Erro na Sincronia", { description: "Verifique a conexão com o servidor de rastreamento." });
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchOccurrences();
    loadFleet();
    fetchSyncInfo();

    const interval = setInterval(() => {
        loadFleet();
        fetchSyncInfo();
    }, 5000); 
    return () => clearInterval(interval);
  }, []);

  const selectedVehicle = useMemo(() => 
    fleet.find(v => v.id === selectedCar), 
    [fleet, selectedCar]
  );

  // Fetch Weather for selected vehicle
  useEffect(() => {
    if (selectedVehicle && selectedVehicle.lat && selectedVehicle.lng) {
      const fetchVehicleWeather = async () => {
        setIsLoadingWeather(true);
        try {
          const token = localStorage.getItem("sisget_token");
          const res = await fetch(`${BACKEND_URL}/api/weather/current?lat=${selectedVehicle.lat}&lon=${selectedVehicle.lng}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            const current = data.current_weather;
            const config = weatherMap[current.weathercode] || { desc: "Condição desconhecida", icon: CloudSun };
            setVehicleWeather({
              temp: Math.round(current.temperature),
              description: config.desc,
              icon: config.icon
            });
          }
        } catch (e) {
          console.error("Erro ao buscar clima do veículo:", e);
        } finally {
          setIsLoadingWeather(false);
        }
      };
      
      fetchVehicleWeather();
    } else {
      setVehicleWeather(null);
    }
  }, [selectedVehicle?.id]);

  const filterOptions = useMemo<FilterOption[]>(() => {
    const vehicles = fleet
      .sort((a, b) => a.id.localeCompare(b.id))
      .map((v) => ({ label: v.id, value: v.id, category: "VEICULO" as const }));

    const routes = Array.from(new Set(fleet.map((v) => v.ROTANOME).filter(Boolean)))
      .sort()
      .map((r) => ({ label: r!, value: r!, category: "ROTA" as const }));

    const areas = Array.from(new Set(fleet.map((v) => v.AREANOME).filter(Boolean)))
      .sort()
      .map((a) => ({ label: a!, value: a!, category: "BASE" as const }));

    return [...areas, ...routes, ...vehicles];
  }, [fleet]);

  const filteredFleet = fleet.filter((v) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      v.id.toLowerCase().includes(search) ||
      (v.VEICPLACA && v.VEICPLACA.toLowerCase().includes(search)) ||
      (v.FUNCNOME && v.FUNCNOME.toLowerCase().includes(search));

    const hasOccurrence = !!occurrences[v.id];

    const matchesFilter =
      selectedFilters.size === 0 ||
      selectedFilters.has(v.id) ||
      (v.ROTANOME && selectedFilters.has(v.ROTANOME)) ||
      (v.AREANOME && selectedFilters.has(v.AREANOME));

    return onlyOccurrences ? matchesSearch && hasOccurrence && matchesFilter : matchesSearch && matchesFilter;
  });

  const handleUniversalSearch = (term: string) => {
    setSearchTerm(term);
    setCustomFocus(null);
  };

  const handleKeyDown = async (e: React.KeyboardEvent) => {
     if (e.key === 'Enter' && searchTerm.trim() && filteredFleet.length === 0) {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchTerm)}&limit=1`, {
              headers: { 'User-Agent': 'SISGET/2.0' }
          });
          const results = await res.json();
          if (results && results.length > 0) {
             setCustomFocus([parseFloat(results[0].lat), parseFloat(results[0].lon)]);
             setSelectedCar(null);
          }
        } catch (err) {
          console.error(err);
        }
     }
  };

  const handleSaveOccurrence = (id: string, text: string) => {
    if (!text.trim()) return;
    const token = localStorage.getItem("sisget_token");
    fetch("/api/fleet/occurrences", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ vehicleId: id, occurrenceText: text }),
    }).then(res => {
      if (res.ok) {
        setOccurrences((prev) => ({ ...prev, [id]: text }));
        toast.success("Ocorrência Salva");
      }
    });
  };

  const handleRemoveOccurrence = (id: string) => {
    const token = localStorage.getItem("sisget_token");
    fetch(`/api/fleet/occurrences?id=${id}`, { 
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    }).then(res => {
      if (res.ok) {
        const next = { ...occurrences };
        delete next[id];
        setOccurrences(next);
        toast.info("Ocorrência Removida");
      }
    });
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {
        console.error("Falha ao entrar em tela cheia");
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  if (!mounted) return (
    <div className="flex items-center justify-center h-screen bg-[var(--background)]">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
    </div>
  );

  return (
    <div ref={containerRef} className="flex h-[calc(100vh-150px)] overflow-hidden rounded-2xl border border-[var(--border)] relative bg-[var(--background)] shadow-2xl transition-all duration-500">
      
      {/* Toggle Button Sidebar */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={`absolute top-1/2 transform -translate-y-1/2 w-8 h-12 bg-[var(--card-bg)] border border-[var(--border)] rounded-r-xl z-50 flex items-center justify-center hover:bg-[var(--secondary)] transition-all duration-500 shadow-xl`}
        style={{ left: isSidebarOpen ? '379px' : '0' }}
      >
        {isSidebarOpen ? <ChevronLeft className="w-5 h-5 text-blue-500" /> : <ChevronRight className="w-5 h-5 text-blue-500" />}
      </button>

      {/* Sidebar List */}
      <div 
        className={`h-full bg-[var(--card-bg)] border-r border-[var(--border)] flex flex-col z-10 shrink-0 transition-all duration-500 ease-in-out relative ${
          isSidebarOpen ? "w-[380px]" : "w-0 overflow-hidden border-none"
        }`}
      >
        <div className="p-5 bg-gradient-to-r from-blue-600 to-blue-500 text-white flex justify-between items-center whitespace-nowrap overflow-hidden">
          <div>
            <h1 className="text-sm font-black uppercase tracking-[0.2em] mb-1" style={{fontFamily: 'var(--font-outfit)'}}>SISGET <span className="opacity-70">FROTA</span></h1>
            <div className="flex items-center gap-1.5 opacity-60">
               <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
               <span className="text-[9px] font-bold uppercase tracking-widest">Sinc: {lastSync}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleToggleAuto}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter transition-all border ${
                autoRefresh 
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)]' 
                : 'bg-red-500/10 border-red-500/50 text-red-500'
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${autoRefresh ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
              {autoRefresh ? 'Auto ON' : 'Auto OFF'}
            </button>
            <button 
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className={`p-2 hover:bg-white/10 rounded-lg transition-colors group ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : 'group-active:rotate-180'} transition-transform duration-500`} />
            </button>
          </div>
        </div>
        
        <div className="p-4 bg-[var(--background)] border-b border-[var(--border)] space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-[var(--foreground-muted)]" />
            <input 
              type="text" 
              className="w-full bg-[var(--card-bg)] border border-[var(--border)] text-[var(--foreground)] text-sm rounded-lg pl-10 pr-4 py-2.5 focus:border-blue-500 outline-none transition-colors placeholder:text-[var(--foreground-muted)]"
              placeholder="Buscar placa, prefixo ou motorista..."
              value={searchTerm}
              onChange={(e) => handleUniversalSearch(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <MultiSelectCombobox 
            options={filterOptions}
            selected={selectedFilters}
            onChange={setSelectedFilters}
          />

          <button 
              onClick={() => setOnlyOccurrences(!onlyOccurrences)}
              className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all
                ${onlyOccurrences 
                  ? 'bg-amber-500/10 border-amber-500 text-amber-500' 
                  : 'bg-[var(--secondary)] border-[var(--border)] text-[var(--foreground-muted)] hover:border-amber-500/50'}`}
          >
              <Bell className={`w-3 h-3 ${onlyOccurrences ? 'fill-amber-500' : ''}`} />
              {onlyOccurrences ? 'Ocorrências Filtradas' : 'Filtrar Ocorrências'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2 relative custom-scrollbar">
          {filteredFleet.length === 0 && (
             <div className="text-center text-[var(--foreground-muted)] text-xs font-bold mt-10 opacity-50 uppercase">Nenhum veículo</div>
          )}
          {filteredFleet.map(v => {
            const hasNote = !!occurrences[v.id];
            const getStatusColor = (status?: string) => {
              if (status === 'online') return 'bg-green-500';
              if (status === 'manutencao') return 'bg-amber-500';
              if (status === 'desligado') return 'bg-gray-400';
              return 'bg-red-500'; 
            };

            return (
              <div 
                key={v.id}
                onClick={() => setSelectedCar(v.id)}
                className={`p-4 rounded-xl border-l-[6px] transition-all cursor-pointer relative bg-[var(--card-bg)] hover:bg-[var(--secondary)]
                  border-[var(--border)] group
                  ${hasNote ? 'border-l-[#ff9800]' : parseInt(v.RASTVELOCIDADE) > 0 ? 'border-l-[#4caf50]' : 'border-l-[var(--border)]'}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black tracking-tight text-[var(--foreground)]" style={{fontFamily: 'var(--font-outfit)'}}>#{v.id}</span>
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(v.STATUS)}`} />
                    <span className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wider">{v.VEICCATNOME}</span>
                  </div>
                  {hasNote && <span className="text-[9px] font-black uppercase bg-[#ff9800] text-black px-2 py-0.5 rounded">Ocorrência</span>}
                </div>
                
                <div className="text-[11px] font-medium text-[var(--foreground-muted)] flex items-center justify-between">
                  <div className="flex gap-2">
                    <span>{v.VEICPLACA}</span>
                    <span>•</span>
                    <span className={parseInt(v.RASTVELOCIDADE) > 0 ? "text-[#4caf50] font-bold" : ""}>{v.RASTVELOCIDADE} KM/H</span>
                  </div>
                  {v.MED_VALOR && v.MED_VALOR !== '-' && (
                    <span className="text-[10px] font-bold bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded flex items-center gap-1">
                       ⛽ {v.MED_VALOR}
                    </span>
                  )}
                </div>

                <div className="mt-2 pt-2 border-t border-[var(--border)] opacity-60 group-hover:opacity-100 transition-opacity">
                   <p className="text-[10px] uppercase font-bold text-[var(--foreground-muted)] truncate">
                      👤 {v.FUNCNOME || 'MOTORISTA NÃO IDENTIFICADO'}
                   </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 h-full relative">
        <MapComponent 
          fleet={filteredFleet} 
          occurrences={occurrences} 
          selectedCar={selectedCar} 
          onSelectCar={(id: string) => {
            setSelectedCar(id);
            setCustomFocus(null);
          }}
          theme={theme}
          customFocus={customFocus}
          lockFocus={lockFocus}
          onToggleFullscreen={toggleFullscreen}
          externalFullscreenState={isFullscreen}
          isSidebarOpen={isSidebarOpen}
        />

        {/* Detail Panel */}
        {selectedCar && (
          <div className="absolute top-6 right-6 w-[420px] max-h-[calc(100%-3rem)] bg-[var(--card-bg)] rounded-3xl shadow-2xl z-[1000] overflow-hidden border border-[var(--border)] animate-in slide-in-from-right-10 flex flex-col">
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-start mb-6">
                <div>
                   <h3 className="text-xl font-black text-[var(--foreground)] tracking-tight">
                     VEÍCULO <span className="text-blue-500">#{selectedCar}</span>
                   </h3>
                   <p className="text-[10px] font-black uppercase text-[var(--foreground-muted)] tracking-widest">{selectedVehicle?.VEICPLACA} • {selectedVehicle?.VEICCATNOME}</p>
                </div>
                 <div className="flex items-center gap-2">
                    {vehicleWeather && (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--secondary)] border border-[var(--border)] animate-in fade-in zoom-in duration-500">
                         <vehicleWeather.icon className="w-4 h-4 text-amber-500" />
                         <span className="text-[10px] font-black text-[var(--foreground)]">{vehicleWeather.temp}°C</span>
                      </div>
                    )}
                   <button 
                     onClick={() => setLockFocus(!lockFocus)}
                     className={`p-2 rounded-full transition-all ${lockFocus ? 'bg-blue-500/10 text-blue-500 shadow-inner' : 'hover:bg-[var(--secondary)] text-[var(--foreground-muted)]'}`}
                   >
                     <LocateFixed className={`w-5 h-5 ${lockFocus ? 'animate-pulse text-blue-600' : ''}`} />
                   </button>
                   <button onClick={() => setSelectedCar(null)} className="p-2 hover:bg-[var(--secondary)] rounded-full transition-colors">
                     <X className="w-5 h-5 text-[var(--foreground-muted)]" />
                   </button>
                 </div>
              </div>

              <div className="space-y-4 pr-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-[var(--secondary)] border border-[var(--border)]">
                    <p className="text-[10px] uppercase font-bold text-[var(--foreground-muted)] mb-1 leading-none">Motorista</p>
                    <p className="text-xs font-bold truncate text-blue-500 uppercase tracking-tighter">{selectedVehicle?.FUNCNOME || 'N.I'}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-[var(--secondary)] border border-[var(--border)]">
                    <p className="text-[10px] uppercase font-bold text-[var(--foreground-muted)] mb-1 leading-none">Última Transmissão</p>
                    <p className="text-xs font-black text-[var(--foreground)]">{selectedVehicle?.RASTDATA || '--/--'}</p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[var(--secondary)] border border-[var(--border)]">
                  <p className="text-[10px] uppercase font-bold text-[var(--foreground-muted)] mb-1 leading-none">Rota Operacional / Itinerário</p>
                  <p className="text-[12px] font-black text-[var(--foreground)] leading-tight uppercase tracking-tight italic">
                     {selectedVehicle?.ROTANOME || 'ROTA NÃO IDENTIFICADA EM TELEMETRIA'}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 rounded-lg bg-[var(--secondary)] border border-[var(--border)] text-center">
                     <p className="text-[9px] uppercase font-bold text-[var(--foreground-muted)] mb-1">Odômetro</p>
                     <p className="text-[10px] font-black text-[var(--foreground)]">{selectedVehicle?.VEICODOMETRO || '0'} KM</p>
                  </div>
                  <div className="p-2 rounded-lg bg-[var(--secondary)] border border-[var(--border)] text-center">
                     <p className="text-[9px] uppercase font-bold text-[var(--foreground-muted)] mb-1">Combustível</p>
                     <p className="text-[10px] font-black text-blue-500">{selectedVehicle?.MED_VALOR && selectedVehicle.MED_VALOR !== '-' ? selectedVehicle.MED_VALOR : '0%'}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-[var(--secondary)] border border-[var(--border)] text-center">
                     <p className="text-[9px] uppercase font-bold text-[var(--foreground-muted)] mb-1">Rotação</p>
                     <p className="text-[10px] font-black text-[var(--foreground)]">{selectedVehicle?.RASTGIRO || '0'} RPM</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                   <div className="flex justify-between items-center mb-2">
                     <p className="text-[10px] uppercase font-bold text-blue-500 leading-none flex items-center gap-2">
                        🛣️ Localização Federal (DNIT)
                     </p>
                     <button 
                       onClick={() => setShowStreetView(true)}
                       className="text-[9px] font-black bg-blue-500 text-white px-2 py-0.5 rounded hover:bg-blue-400 transition-colors uppercase tracking-tighter"
                     >
                       Street View
                     </button>
                   </div>
                    <p className="text-xs font-black text-[var(--foreground)] uppercase tracking-tighter">
                      {selectedVehicle?.dnitMcr || 'CONSULTANDO...'}
                    </p>
                </div>

                <div className="space-y-3 pt-4 border-t border-[var(--border)]">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase text-[var(--foreground-muted)] tracking-widest">Anotações do CCO</label>
                    {occurrences[selectedCar] && (
                       <button onClick={() => handleRemoveOccurrence(selectedCar)} className="text-[9px] font-black text-red-500 hover:underline uppercase">LIMPAR</button>
                    )}
                  </div>
                  <textarea 
                    id="occ-text"
                    key={selectedCar}
                    defaultValue={occurrences[selectedCar] || ''}
                    className="w-full h-32 p-4 rounded-2xl bg-[var(--background)] border border-[var(--border)] text-sm focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-[var(--foreground-muted)]"
                    placeholder="Descreva problemas, atrasos ou trocas de motorista..."
                  />
                  <button 
                    onClick={() => {
                      const el = document.getElementById('occ-text') as HTMLTextAreaElement;
                      handleSaveOccurrence(selectedCar, el.value);
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black uppercase tracking-widest py-4 rounded-2xl transition-all shadow-xl hover:shadow-blue-500/20 active:scale-[0.98]">
                    Salvar Mudanças
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Street View Modal Overlay */}
      {showStreetView && selectedVehicle && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300">
           <div className="relative w-full max-w-6xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col">
              <div className="p-4 bg-[var(--card-bg)] border-b border-[var(--border)] flex justify-between items-center">
                 <h2 className="text-sm font-black text-[var(--foreground)] uppercase tracking-widest flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    Street View: #{selectedCar} ({selectedVehicle.VEICPLACA})
                 </h2>
                 <button onClick={() => setShowStreetView(false)} className="p-2 hover:bg-[var(--secondary)] rounded-full transition-colors text-[var(--foreground-muted)]">
                    <X className="w-6 h-6" />
                 </button>
              </div>
              <div className="flex-1 bg-neutral-900 relative">
                 <iframe 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    loading="lazy" 
                    allowFullScreen 
                    src={`https://www.google.com/maps/embed/v1/streetview?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'NOT_SET'}&location=${selectedVehicle.lat},${selectedVehicle.lng}`}
                 />
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
