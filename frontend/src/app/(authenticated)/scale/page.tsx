"use client";

import { useState, useEffect } from "react";
import { 
  Calendar, 
  RefreshCcw, 
  Search, 
  Clock, 
  MapPin, 
  User, 
  Bus,
  FileText,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Plus,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { motion } from "motion/react";

import * as XLSX from "xlsx";

// ─── Types ───────────────────────────────────────────────────────────────────
interface EscalaItem {
  id: number;
  diaSemana: string;
  data: string;
  garagem: string;
  carro: string;
  hrGaragem: string;
  hrSaida: string;
  origem: string;
  destino: string;
  motorista: string;
  linha: string;
  trecho: string;
  servico: string;
}

interface SortConfig {
  key: keyof EscalaItem | null;
  direction: 'ascending' | 'descending';
}

export default function ScalePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState("-");
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  });
  const [escalaData, setEscalaData] = useState<EscalaItem[]>([]);
  const [filteredEscala, setFilteredEscala] = useState<EscalaItem[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'ascending' });

  // Modal States
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [selectedDriverData, setSelectedDriverData] = useState<any>(null);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [selectedVehicleData, setSelectedVehicleData] = useState<any>(null);
  const [isLoadingModal, setIsLoadingModal] = useState(false);

  const fetchEscala = async (dateParam: string) => {
    setIsSyncing(true);
    try {
      const BACKEND_URL = typeof window !== "undefined" 
        ? `http://${window.location.hostname}:8080` 
        : "http://localhost:8080";
      const token = localStorage.getItem("sisget_token");
      const response = await fetch(`${BACKEND_URL}/api/escalas?data=${dateParam}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        const mappedData = data.map((item: any) => ({
          id: item.id,
          diaSemana: item.diaSemana,
          data: item.data,
          garagem: item.garagem,
          carro: item.carro,
          hrGaragem: item.horarioGaragem?.substring(0, 5) || "--:--",
          hrSaida: item.horarioSaida?.substring(0, 5) || "--:--",
          origem: item.origem,
          destino: item.destino,
          motorista: item.motorista,
          linha: item.linha,
          trecho: item.trecho,
          servico: item.servico
        }));
        setEscalaData(mappedData);
        setFilteredEscala(mappedData);
        setLastSync(new Date().toLocaleString('pt-BR', { 
          day: '2-digit', month: '2-digit', year: 'numeric', 
          hour: '2-digit', minute: '2-digit' 
        }));
      }
    } catch (error) {
      console.error("Erro na integração:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchEscala(selectedDate);
  }, [selectedDate]);

  const changeDate = (days: number) => {
    const current = new Date(selectedDate + "T12:00:00");
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const handleSort = (key: keyof EscalaItem) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  useEffect(() => {
    let filtered = escalaData.filter(item => 
      (item.motorista || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.carro || "").includes(searchTerm) ||
      (item.linha || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.trecho || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.origem || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.destino || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortConfig.key !== null) {
      filtered.sort((a, b) => {
        const aValue = String(a[sortConfig.key!] || "");
        const bValue = String(b[sortConfig.key!] || "");
        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }

    setFilteredEscala(filtered);
  }, [searchTerm, escalaData, sortConfig]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsSyncing(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const targetSheetName = workbook.SheetNames.find((name) =>
        /IMP(ERATRIZ)?/i.test(name)
      );
      if (!targetSheetName) {
        throw new Error(
          `Nenhuma aba com 'IMP' ou 'IMPERATRIZ' foi encontrada nesta planilha.\n` +
          `Abas disponíveis: ${workbook.SheetNames.join(", ")}`
        );
      }
      const sheet = workbook.Sheets[targetSheetName];
      const rows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1, raw: false, dateNF: "yyyy-mm-dd" });
      
      if (rows.length < 2) throw new Error("A planilha parece estar vazia.");

      const payload = [];
      let lastDiaSemana = "";
      let lastData = "";

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;

        // Filtro de BASE: ignora registros que não sejam da base IMPERATRIZ (coluna C)
        const base = String(row[2] || "").trim().toUpperCase();
        if (base && !base.includes("IMPERATRIZ")) continue;

        const normalizeDate = (val: any): string => {
          if (!val) return lastData;
          let s = String(val).trim();
          if (!s || s.toLowerCase() === 'undefined') return lastData;

          // Caso 1: Já está em formato ISO (YYYY-MM-DD)
          if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

          // Caso 2: Serial de Excel (ex: "45345")
          if (/^\d{5}$/.test(s)) {
            const date = new Date(Math.round((Number(s) - 25569) * 86400 * 1000));
            return date.toISOString().split('T')[0];
          }

          // Caso 3: Separadores comuns (/, -, .)
          const sepMatch = s.match(/[.\/-]/);
          if (sepMatch) {
            const sep = sepMatch[0];
            const parts = s.split(sep);
            if (parts.length === 3) {
              let d = parts[0], m = parts[1], y = parts[2];
              // Se o primeiro campo for o ano (YYYY)
              if (d.length === 4) [d, y] = [y, d];
              // Tenta detectar MM/DD vs DD/MM
              if (parseInt(d) <= 12 && parseInt(m) > 12) [d, m] = [m, d];
              if (y.length === 2) y = "20" + y;
              return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
            }
          }
          return s || lastData;
        };

        const diaSemana = (row[0] || lastDiaSemana);
        const dataVal = normalizeDate(row[1]);
        
        lastDiaSemana = diaSemana;
        if (dataVal) lastData = dataVal;

        if (!dataVal) continue;

        const formatTime = (t: any) => {
          if (!t) return null;
          let str = String(t).trim();
          if (str.toLowerCase() === 'undefined' || str === '') return null;
          if (str.includes(' ')) str = str.split(' ')[1];
          if (str.includes(':')) {
             const p = str.split(':');
             return `${p[0].padStart(2, '0')}:${p[1].padStart(2, '0')}:00`;
          }
          return null;
        };

        const cleanStr = (val: any) => {
          if (val === undefined || val === null) return "";
          let s = String(val).trim();
          if (s.toLowerCase() === 'undefined') return "";
          return s;
        };

        payload.push({
          diaSemana: String(diaSemana || "").toUpperCase(),
          data: dataVal,
          garagem: cleanStr(row[2]),
          carro: cleanStr(row[3]),
          horarioGaragem: formatTime(row[4]),
          horarioSaida: formatTime(row[5]),
          origem: cleanStr(row[6]),
          destino: cleanStr(row[7]),
          motorista: cleanStr(row[8]),
          trecho: "", // Ignorado conforme orientação (Coluna J)
          linha: cleanStr(row[10]),   // Coluna K
          servico: cleanStr(row[11])
        });
      }

      const token = localStorage.getItem("sisget_token");
      const BACKEND_URL = typeof window !== "undefined" ? `http://${window.location.hostname}:8080` : "http://localhost:8080";
      const response = await fetch(`${BACKEND_URL}/api/escalas/sync`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const syncDate = payload.length > 0 ? payload[0].data : undefined;
        if (syncDate) setSelectedDate(syncDate);
        else await fetchEscala(selectedDate);
        alert(`Sucesso! ${payload.length} escalas sincronizadas.`);
      } else {
        alert("Falha na sincronização.");
      }
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Erro no processamento.");
    } finally {
      setIsSyncing(false);
      if (event.target) event.target.value = '';
    }
  };

  const handleOpenDriverModal = async (motoristaStr: string) => {
    if (!motoristaStr) return;
    const matricula = motoristaStr.includes(" - ") ? motoristaStr.split(" - ")[1] : motoristaStr;
    setIsLoadingModal(true);
    try {
      const token = localStorage.getItem("sisget_token");
      const BACKEND_URL = typeof window !== "undefined" ? `http://${window.location.hostname}:8080` : "http://localhost:8080";
      const response = await fetch(`${BACKEND_URL}/api/search/motorista/${matricula}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setSelectedDriverData(await response.json());
        setIsDriverModalOpen(true);
      } else {
        alert("Motorista não encontrado na base.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingModal(false);
    }
  };

  const handleOpenVehicleModal = async (rawPrefix: string) => {
    if (!rawPrefix || rawPrefix.toUpperCase() === 'CANCELADO') return;
    const prefixo = rawPrefix.trim();
    setIsLoadingModal(true);
    try {
      const token = localStorage.getItem("sisget_token");
      const BACKEND_URL = typeof window !== "undefined" ? `http://${window.location.hostname}:8080` : "http://localhost:8080";
      // Busca dados do veículo
      const vResp = await fetch(`${BACKEND_URL}/api/search/veiculo/${prefixo}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Busca dados de rastreamento (Point 3)
      const tResp = await fetch(`${BACKEND_URL}/api/fleet/latest`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (vResp.ok) {
        const vData = await vResp.json();
        let tracking = null;
        let city = null;

        if (tResp.ok) {
          const tData = await tResp.json();
          tracking = tData.fleet.find((f: any) => f.vehicleId === prefixo);
          
          // Requisição sob demanda para geocodificação (Point: "rodar quando focarmos")
          try {
            const gResp = await fetch(`${BACKEND_URL}/api/search/geocoding/vehicle/${prefixo}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (gResp.ok) {
              const gData = await gResp.json();
              if (gData) city = gData.city;
            }
          } catch (ge) {
            console.warn("Geocoding on-demand falhou:", ge);
          }
        }

        setSelectedVehicleData({ 
          ...vData, 
          tracking: tracking ? { ...tracking, cityLocation: city || tracking.cityLocation } : null 
        });
        setIsVehicleModalOpen(true);
      } else {
        alert("Veículo não encontrado na base.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingModal(false);
    }
  };

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-20">
      {/* Header Section */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <p className="text-xs font-bold text-muted uppercase tracking-widest">Módulo</p>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-black tracking-tight" style={{ fontFamily: 'var(--font-outfit)' }}>
              Escala do Fluxo
            </h1>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${isSyncing ? 'bg-amber-500/10 text-amber-500 animate-pulse' : 'bg-emerald-500/10 text-emerald-500'}`}>
              {isSyncing ? <>Atualizando...</> : <><CheckCircle2 className="w-3 h-3" />Pronto</>}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-bold text-muted uppercase tracking-widest leading-none mb-1">Status da Sessão</p>
            <p className="text-sm font-medium text-[var(--foreground)]">{lastSync === "-" ? "Aguardando Carga" : `Última carga: ${lastSync}`}</p>
          </div>
        </div>
      </section>

      {/* Date Navigation & Integration Info */}
      <section className="flex flex-col xl:flex-row gap-6">
        <div className="glass p-6 rounded-2xl flex flex-1 items-center justify-between border-l-4 border-emerald-500">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted uppercase tracking-widest leading-none mb-1">Visualizar Data</p>
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent border-none outline-none font-bold text-lg text-[var(--foreground)] cursor-pointer"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button onClick={() => changeDate(-1)} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-[var(--secondary)] transition-colors border border-[var(--border)]"><ChevronLeft className="w-4 h-4" /></button>
            <button onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])} className="px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-[var(--secondary)] transition-colors border border-[var(--border)] rounded-lg">Hoje</button>
            <button onClick={() => changeDate(1)} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-[var(--secondary)] transition-colors border border-[var(--border)]"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl flex items-center justify-between gap-6 border-l-4 border-blue-500 min-w-[400px]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500"><FileText className="w-5 h-5" /></div>
            <div>
              <h3 className="font-bold text-xs">Carga de Dados Local</h3>
              <p className="text-muted text-[10px] mt-0.5">Clique no botão para importar a planilha (.xlsx)</p>
            </div>
          </div>
          <label className="flex items-center gap-2 text-[10px] font-bold text-blue-500 hover:text-blue-400 transition-colors bg-blue-500/5 px-4 py-2 rounded-lg cursor-pointer">
            <Plus className="w-3 h-3" />IMPORTAR ARQUIVO
            <input type="file" className="hidden" accept=".xlsx,.xls" onChange={handleFileUpload} />
          </label>
        </div>
      </section>

      {/* Search (Simplified - Point 1) */}
      <section>
        <div className="flex-1 glass flex items-center gap-3 px-4 py-4 rounded-2xl focus-within:ring-2 focus-within:ring-blue-500/30 border border-[var(--border)] transition-all">
          <Search className="w-5 h-5 text-muted" />
          <input 
            type="text" 
            placeholder="Pesquisar por motorista, frota ou trecho..." 
            className="bg-transparent border-none outline-none w-full text-base placeholder:text-muted"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </section>

      {/* Scale Table */}
      <section className="glass rounded-2xl overflow-hidden border border-[var(--border)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--secondary)]/50">
                <th onClick={() => handleSort('hrSaida')} className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest cursor-pointer hover:text-blue-500 transition-colors">Início / Saída</th>
                <th onClick={() => handleSort('carro')} className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest cursor-pointer hover:text-blue-500 transition-colors">Veículo</th>
                <th onClick={() => handleSort('motorista')} className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest cursor-pointer hover:text-blue-500 transition-colors">Motorista</th>
                <th onClick={() => handleSort('trecho')} className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest cursor-pointer hover:text-blue-500 transition-colors">Trecho / Linha</th>
                <th onClick={() => handleSort('servico')} className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest cursor-pointer hover:text-blue-500 transition-colors">Serviço</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filteredEscala.length > 0 ? (
                filteredEscala.map((item, idx) => {
                  const isCancelled = (item.carro || "").toUpperCase() === 'CANCELADO';
                  return (
                    <motion.tr 
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className={`hover:bg-[var(--secondary)] transition-colors group ${isCancelled ? 'bg-red-500/10' : ''}`}
                    >
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-0.5">
                          <div className={`flex items-center gap-2 text-sm font-bold ${isCancelled ? 'text-red-500' : ''}`}>
                            <Clock className={`w-3.5 h-3.5 ${isCancelled ? 'text-red-500' : 'text-blue-500'}`} />
                            {item.hrSaida}
                          </div>
                          <span className="text-[9px] text-muted font-bold">GARAGEM: {item.hrGaragem}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div 
                          className="flex items-center gap-3 cursor-pointer group/v" 
                          onClick={() => handleOpenVehicleModal(item.carro)}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${isCancelled ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-[var(--secondary)] text-blue-500 border-[var(--border)] group-hover/v:bg-blue-500/10 group-hover/v:border-blue-500/20'}`}>
                            <Bus className="w-4 h-4" />
                          </div>
                          <span className={`text-sm font-black italic tracking-tighter ${isCancelled ? 'text-red-500 animate-pulse' : ''}`}>{item.carro}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div 
                          className="flex items-center gap-3 cursor-pointer hover:opacity-70 transition-opacity"
                          onClick={() => handleOpenDriverModal(item.motorista)}
                        >
                          <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500"><User className="w-4 h-4" /></div>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold leading-none mb-1">{item.motorista ? item.motorista.split(' - ')[0] : '---'}</span>
                            <span className="text-[10px] text-muted font-mono">{item.motorista && item.motorista.includes('-') ? item.motorista.split(' - ')[1] : ''}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1 max-w-[240px]">
                          <span className="text-xs font-bold uppercase tracking-tight truncate">{item.trecho || item.linha}</span>
                          <div className="flex items-center gap-2 text-[10px] text-muted font-medium">
                            <span>{item.origem}</span>
                            <div className="w-3 h-px bg-muted/30" />
                            <span>{item.destino}</span>
                            <span className="ml-auto opacity-50 font-mono text-[8px]">{item.linha}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-[11px] font-black tracking-widest text-muted">{item.servico}</span>
                      </td>
                    </motion.tr>
                  );
                })
              ) : (
                <tr><td colSpan={5} className="px-6 py-20 text-center opacity-30"><AlertCircle className="w-10 h-10 mx-auto mb-2" /><p className="text-xs font-bold uppercase">Sem resultados</p></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Improved Footer (Point 7) */}
      <section className="flex flex-wrap items-center gap-8 text-[11px] font-bold text-muted uppercase tracking-[0.2em] bg-[var(--secondary)]/30 p-6 rounded-2xl border border-[var(--border)]">
        <div className="flex items-center gap-2 text-[var(--foreground)]"><div className="w-2 h-2 rounded-full bg-blue-500" /> TOTAL: {escalaData.length}</div>
        {Array.from(new Set(escalaData.map(i => i.garagem))).filter(Boolean).map(garagem => (
          <div key={garagem} className="flex items-center gap-2">
            <MapPin className="w-3 h-3" /> {garagem}: {escalaData.filter(i => i.garagem === garagem).length}
          </div>
        ))}
      </section>

      {/* Driver Modal */}
      {isDriverModalOpen && selectedDriverData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass max-w-md w-full p-8 rounded-3xl border border-blue-500/20 relative">
            <button onClick={() => setIsDriverModalOpen(false)} className="absolute top-4 right-4 text-muted hover:text-[var(--foreground)]"><Plus className="w-6 h-6 rotate-45" /></button>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 mb-2"><User className="w-10 h-10" /></div>
              <h2 className="text-2xl font-black">{selectedDriverData.nome}</h2>
              <p className="px-4 py-1 bg-blue-500/10 text-blue-500 text-xs font-bold rounded-full">MATRÍCULA: {selectedDriverData.matricula}</p>
              <div className="w-full grid grid-cols-2 gap-4 mt-6 text-left">
                <div className="glass p-4 rounded-xl">
                  <p className="text-[10px] text-muted font-bold uppercase">Status</p>
                  <p className="text-sm font-bold">ATIVO</p>
                </div>
                <div className="glass p-4 rounded-xl">
                  <p className="text-[10px] text-muted font-bold uppercase">Filial</p>
                  <p className="text-sm font-bold">IMPERATRIZ</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Vehicle Modal - Point 3 */}
      {isVehicleModalOpen && selectedVehicleData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass max-w-lg w-full p-8 rounded-3xl border border-blue-500/20 relative">
            <button onClick={() => setIsVehicleModalOpen(false)} className="absolute top-4 right-4 text-muted hover:text-[var(--foreground)]"><Plus className="w-6 h-6 rotate-45" /></button>
            <div className="flex gap-6 items-start">
              <div className="w-24 h-24 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 flex-shrink-0"><Bus className="w-12 h-12" /></div>
              <div className="space-y-1">
                <h2 className="text-3xl font-black italic tracking-tighter" style={{ fontFamily: 'var(--font-outfit)' }}>{selectedVehicleData.prefixo}</h2>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-[var(--secondary)] border border-[var(--border)] rounded font-mono text-xs font-bold">{selectedVehicleData.placa}</span>
                  <span className="text-emerald-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Operacional</span>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <h3 className="text-xs font-bold text-muted uppercase tracking-widest">Última Localização (Rastreamento)</h3>
              <div className="glass p-6 rounded-2xl border-l-4 border-emerald-500">
                {selectedVehicleData.tracking ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-xl font-bold">{selectedVehicleData.tracking.cityLocation || "Não informado"}</p>
                        <p className="text-[10px] text-muted font-bold uppercase">Estado: {selectedVehicleData.tracking.areaName || "--"}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-mono font-bold">{selectedVehicleData.tracking.speed} km/h</p>
                        <p className="text-[9px] text-muted">Sincronizado às {selectedVehicleData.tracking.transmissionDate?.split(' ')[1] || ""}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted italic">Dados de rastreamento não disponíveis para este prefixo.</p>
                )}
              </div>
            </div>
            
            <div className="mt-8 flex gap-3">
              <button onClick={() => setIsVehicleModalOpen(false)} className="flex-1 bg-white text-black font-bold py-3 rounded-xl hover:opacity-90 transition-opacity">FECHAR DETALHES</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Loading Overlay for Modals */}
      {isLoadingModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
           <RefreshCcw className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      )}
    </div>
  );
}
