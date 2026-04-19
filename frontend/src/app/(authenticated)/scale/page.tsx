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
  servico: string;
}

export default function ScalePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState("-");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [escalaData, setEscalaData] = useState<EscalaItem[]>([]);
  const [filteredEscala, setFilteredEscala] = useState<EscalaItem[]>([]);

  const fetchEscala = async (dateParam: string) => {
    setIsSyncing(true);
    try {
      console.log("Buscando escalas para a data:", dateParam);
      
      const token = localStorage.getItem("sisget_token");
      const response = await fetch(`http://localhost:8080/api/escalas?data=${dateParam}`, {
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
      console.error("Erro na integração com backend:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchEscala(selectedDate);
  }, [selectedDate]);

  const changeDate = (days: number) => {
    const current = new Date(selectedDate + "T12:00:00"); // avoid tz issues
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  useEffect(() => {
    const filtered = escalaData.filter(item => 
      (item.motorista || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.carro || "").includes(searchTerm) ||
      (item.linha || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.origem || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.destino || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEscala(filtered);
  }, [searchTerm, escalaData]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log("Iniciando processamento do arquivo:", file.name);
    setIsSyncing(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];

      const rows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1, raw: false, dateNF: "yyyy-mm-dd" });
      
      console.log("Total de linhas lidas (incluindo cabeçalho):", rows.length);
      if (rows.length < 2) throw new Error("A planilha parece estar vazia.");

      const payload = [];
      let lastDiaSemana = "";
      let lastData = "";

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;

        const diaSemana = (row[0] || lastDiaSemana);
        let dataVal = (row[1] || lastData);
        lastDiaSemana = diaSemana;
        lastData = dataVal;

        if (!dataVal) continue;
        
        // Inteligência de Data (Suporta DD/MM/YYYY, M/D/YY, etc)
        if (dataVal.includes("/")) {
           const parts = dataVal.split("/");
           if (parts.length === 3) {
             let d = parts[0], m = parts[1], y = parts[2];
             // Se o primeiro par é > 12, assume BR (DD/MM/YYYY). Se <= 12 e segundo > 12, assume US (MM/DD/YYYY)
             if (parseInt(d) <= 12 && parseInt(m) > 12) {
                // Swap para US -> ISO
                [d, m] = [m, d];
             }
             if (y.length === 2) y = "20" + y;
             dataVal = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
           }
        }

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
          if (s.endsWith('.0')) s = s.replace('.0', '');
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
          linha: cleanStr(row[9]),
          servico: cleanStr(row[11])
        });
      }

      console.log("Payload final para API:", payload.slice(0, 2));

      const token = localStorage.getItem("sisget_token");
      const response = await fetch("http://localhost:8080/api/escalas/sync", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        // Pega a data de um dos itens do payload para recarregar a visão correta
        const syncDate = payload.length > 0 ? payload[0].data : undefined;
        if (syncDate) setSelectedDate(syncDate);
        else await fetchEscala(selectedDate);
        
        alert(`Sucesso! ${payload.length} escalas sincronizadas.`);
      } else {
        const contentType = response.headers.get("content-type");
        let msg = "Erro desconhecido no servidor.";
        if (contentType && contentType.includes("application/json")) {
           const errorData = await response.json();
           msg = errorData.message || msg;
        }
        alert(`Falha: ${msg}`);
      }
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Erro no processamento.");
    } finally {
      setIsSyncing(false);
      if (event.target) event.target.value = '';
    }
  };

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto">
      {/* Header Section */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <p className="text-xs font-bold text-muted uppercase tracking-widest">Módulo</p>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-black tracking-tight" style={{ fontFamily: 'var(--font-outfit)' }}>
              Escala do Fluxo
            </h1>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${isSyncing ? 'bg-amber-500/10 text-amber-500 animate-pulse' : 'bg-emerald-500/10 text-emerald-500'}`}>
              {isSyncing ? (
                <>Atualizando...</>
              ) : (
                <>
                  <CheckCircle2 className="w-3 h-3" />
                  Pronto
                </>
              )}
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
        {/* Date Selector */}
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
            <button 
              onClick={() => changeDate(-1)}
              className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-[var(--secondary)] transition-colors border border-[var(--border)]"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="sr-only">Anterior</span>
            </button>
            <button 
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              className="px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-[var(--secondary)] transition-colors border border-[var(--border)] rounded-lg"
            >
              Hoje
            </button>
            <button 
              onClick={() => changeDate(1)}
              className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-[var(--secondary)] transition-colors border border-[var(--border)]"
            >
              <ChevronRight className="w-4 h-4" />
              <span className="sr-only">Próximo</span>
            </button>
          </div>
        </div>

        {/* Integration Card (Small) */}
        <div className="glass p-6 rounded-2xl flex items-center justify-between gap-6 border-l-4 border-blue-500 min-w-[400px]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-xs">Carga de Dados Local</h3>
              <p className="text-muted text-[10px] mt-0.5">Clique no botão para importar a planilha (.xlsx)</p>
            </div>
          </div>
          <label className="flex items-center gap-2 text-[10px] font-bold text-blue-500 hover:text-blue-400 transition-colors bg-blue-500/5 px-4 py-2 rounded-lg cursor-pointer">
            <Plus className="w-3 h-3" />
            IMPORTAR ARQUIVO
            <input type="file" className="hidden" accept=".xlsx,.xls" onChange={handleFileUpload} />
          </label>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 glass flex items-center gap-3 px-4 py-3 rounded-xl focus-within:border-blue-500/50 border border-[var(--border)] transition-all">
          <Search className="w-5 h-5 text-muted" />
          <input 
            type="text" 
            placeholder="Buscar por motorista, frota ou linha..." 
            className="bg-transparent border-none outline-none w-full text-sm placeholder:text-muted"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button className="glass px-4 py-3 rounded-xl border border-[var(--border)] text-xs font-bold text-muted uppercase tracking-widest hover:bg-[var(--secondary)] transition-all">
            Filtros
          </button>
          <button className="glass px-4 py-3 rounded-xl border border-[var(--border)] text-xs font-bold text-muted uppercase tracking-widest hover:bg-[var(--secondary)] transition-all">
            Exportar
          </button>
        </div>
      </section>

      {/* Scale Table */}
      <section className="glass rounded-2xl overflow-hidden border border-[var(--border)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--secondary)]/50">
                <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest">Início / Saída</th>
                <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest">Veículo</th>
                <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest">Base / Garagem</th>
                <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest">Motorista</th>
                <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest">Trecho / Linha</th>
                <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest">Serviço</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filteredEscala.length > 0 ? (
                filteredEscala.map((item, idx) => (
                  <motion.tr 
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-[var(--secondary)] transition-colors group"
                  >
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-sm font-bold">
                          <Clock className="w-3.5 h-3.5 text-blue-500" />
                          {item.hrSaida}
                        </div>
                        <div className="text-[10px] text-muted flex items-center gap-1">
                          <span className="font-bold">GARAGEM:</span> {item.hrGaragem}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[var(--secondary)] flex items-center justify-center text-blue-500 border border-[var(--border)] group-hover:bg-blue-500/10 group-hover:border-blue-500/20 transition-all">
                          <Bus className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-black italic tracking-tighter" style={{ fontFamily: 'var(--font-outfit)' }}>{item.carro}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-xs font-semibold">
                        <MapPin className="w-3.5 h-3.5 text-muted" />
                        {item.garagem}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                          <User className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold leading-none mb-1">{item.motorista ? item.motorista.split(' - ')[0] : 'N/A'}</span>
                          <span className="text-[10px] text-muted font-mono">{item.motorista && item.motorista.includes('-') ? item.motorista.split(' - ')[1] : ''}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1 max-w-[240px]">
                        <span className="text-xs font-bold uppercase tracking-tight truncate">{item.linha}</span>
                        <div className="flex items-center gap-2 text-[10px] text-muted font-medium">
                          <span>{item.origem}</span>
                          <div className="w-4 h-px bg-[var(--border)]" />
                          <span>{item.destino}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`text-[10px] font-black px-2 py-1 rounded border ${
                        item.servico === 'LINHA' 
                          ? 'border-blue-500/20 bg-blue-500/5 text-blue-500' 
                          : 'border-purple-500/20 bg-purple-500/5 text-purple-500'
                      }`}>
                        {item.servico}
                      </span>
                    </td>
                  </motion.tr>

                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-30">
                      <AlertCircle className="w-10 h-10" />
                      <p className="text-sm font-bold uppercase tracking-widest">Nenhum resultado encontrado</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Footer / Summary Info */}
      <section className="flex items-center gap-4 text-[10px] font-bold text-muted uppercase tracking-widest">
        <span>Total de Saídas: {escalaData.length}</span>
        <div className="w-1 h-1 rounded-full bg-muted" />
        <span>Imperatriz: {escalaData.filter(i => i.garagem === 'IMPERATRIZ').length}</span>
        <div className="w-1 h-1 rounded-full bg-muted" />
        <span>Outras Bases: {escalaData.filter(i => i.garagem !== 'IMPERATRIZ').length}</span>
      </section>
    </div>
  );
}
