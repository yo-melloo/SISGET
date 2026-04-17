"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { Search, Loader2, X, RefreshCw, Bell, MapPin } from "lucide-react";
import { useTheme } from "next-themes";

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
}

export default function TrackingPage() {
  const [fleet, setFleet] = useState<FleetVehicle[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCar, setSelectedCar] = useState<string | null>(null);
  const [occurrences, setOccurrences] = useState<Record<string, string>>({});
  const [onlyOccurrences, setOnlyOccurrences] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const loadFleet = async () => {
    try {
      const res = await fetch("/api/fleet/status");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const parsed = data.map((v: any) => ({
        ...v,
        id: v.VEICPREFIXO || v.VEICCODIGO,
        lat: parseFloat(v.RASTLATITUDE),
        lng: parseFloat(v.RASTLONGITUDE)
      })).filter((v: FleetVehicle) => !isNaN(v.lat) && !isNaN(v.lng));
      setFleet(parsed);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchOccurrences = async () => {
    try {
      const res = await fetch("/api/fleet/occurrences");
      const data = await res.json();
      const occs: Record<string, string> = {};
      data.forEach((item: any) => {
        occs[item.vehicleId] = item.occurrenceText;
      });
      setOccurrences(occs);
    } catch (e) {
      console.error(e);
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Primeiro dispara a ação do bot (Scraper)
      await fetch("/api/fleet/refresh", { method: 'POST' });
      // Depois recarrega os dados locais
      await Promise.all([loadFleet(), fetchOccurrences()]);
    } catch (e) {
      console.error("Falha ao atualizar bot:", e);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchOccurrences();
    loadFleet();
    const interval = setInterval(() => {
        loadFleet();
        fetchOccurrences();
    }, 5000); 
    return () => clearInterval(interval);
  }, []);

  const handleSaveOccurrence = (id: string, text: string) => {
    if (!text.trim()) return;
    fetch("/api/fleet/occurrences", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vehicleId: id, occurrenceText: text })
    }).then(() => {
      setOccurrences(prev => ({ ...prev, [id]: text }));
    });
  };

  const handleRemoveOccurrence = (id: string) => {
    fetch(`/api/fleet/occurrences?id=${id}`, { method: 'DELETE' })
      .then(() => {
        const next = { ...occurrences };
        delete next[id];
        setOccurrences(next);
      });
  };

  const filteredFleet = fleet.filter(v => {
    const matchesSearch = v.id.toLowerCase().includes(searchTerm.toLowerCase());
    const hasOccurrence = !!occurrences[v.id];
    return onlyOccurrences ? (matchesSearch && hasOccurrence) : matchesSearch;
  });

  const selectedVehicle = fleet.find(v => v.id === selectedCar);

  if (!mounted) return (
    <div className="flex items-center justify-center h-screen bg-[var(--background)]">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-150px)] overflow-hidden rounded-2xl border border-[var(--border)] relative bg-[var(--background)] shadow-2xl">
      {/* Sidebar List */}
      <div className="w-[380px] h-full bg-[var(--card-bg)] border-r border-[var(--border)] flex flex-col z-10 shrink-0">
        <div className="p-5 bg-gradient-to-r from-blue-600 to-blue-500 text-white flex justify-between items-center">
          <div>
            <h1 className="text-sm font-black uppercase tracking-[0.2em] mb-1" style={{fontFamily: 'var(--font-outfit)'}}>SISGET <span className="opacity-70">FROTA</span></h1>
            <p className="text-[10px] uppercase tracking-widest font-semibold opacity-90">Rastreamento Tático</p>
          </div>
          <button 
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className={`p-2 hover:bg-white/10 rounded-lg transition-colors group ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Sincronizar com Servidor LifeWeb"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : 'group-active:rotate-180'} transition-transform duration-500`} />
          </button>
        </div>
        
        <div className="p-4 bg-[var(--background)] border-b border-[var(--border)] space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-[var(--foreground-muted)]" />
            <input 
              type="text" 
              className="w-full bg-[var(--card-bg)] border border-[var(--border)] text-[var(--foreground)] text-sm rounded-lg pl-10 pr-4 py-2.5 focus:border-blue-500 outline-none transition-colors placeholder:text-[var(--foreground-muted)]"
              placeholder="Buscar prefixo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <button 
               onClick={() => setOnlyOccurrences(!onlyOccurrences)}
               className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all
                  ${onlyOccurrences 
                    ? 'bg-amber-500/10 border-amber-500 text-amber-500' 
                    : 'bg-[var(--secondary)] border-[var(--border)] text-[var(--foreground-muted)] hover:border-amber-500/50'}`}
            >
               <Bell className={`w-3 h-3 ${onlyOccurrences ? 'fill-amber-500' : ''}`} />
               {onlyOccurrences ? 'Filtrando Ocorrências' : 'Todas as Ocorrências'}
            </button>
          </div>
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
              return 'bg-red-500'; // offline
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

                {hasNote && (
                  <div className="mt-2 text-[11px] text-[#ff9800] italic opacity-90 line-clamp-2">
                     <span className="font-bold not-italic text-[10px] uppercase bg-[#ff9800]/20 px-1 rounded mr-1">Nota</span>
                     {occurrences[v.id]}
                  </div>
                )}
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
          onSelectCar={(id: string) => setSelectedCar(id)}
          theme={theme}
        />

        {/* Detail Panel - Right Sidebar Overlay */}
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
                <button onClick={() => setSelectedCar(null)} className="p-2 hover:bg-[var(--secondary)] rounded-full transition-colors">
                  <X className="w-5 h-5 text-[var(--foreground-muted)]" />
                </button>
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

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                   <p className="text-[10px] uppercase font-bold text-amber-500 mb-2 leading-none flex items-center gap-2">
                     <MapPin className="w-3 h-3" /> Região / Ponto de Controle
                   </p>
                   <p className="text-xs font-bold text-[var(--foreground)] uppercase tracking-tighter">{selectedVehicle?.AREANOME || 'FORA DE ÁREA MAPEADA'}</p>
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
    </div>
  );
}
