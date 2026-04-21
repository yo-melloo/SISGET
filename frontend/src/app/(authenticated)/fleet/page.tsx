"use client";

import { useState, useEffect } from "react";
import {
  BusFront,
  MapPin,
  Plus,
  Pencil,
  Trash2,
  X,
  ChevronDown,
  Car,
  Wrench,
  AlertCircle,
  FileText,
  Sun,
  Moon,
  Calendar,
  Clock,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────
type Base = "IMP" | "SLZ" | "BEL";
type Turno = "DIURNO" | "NOTURNO";

interface Posicionamento {
  id: number;
  data: string;
  frota: string;
  horario: string;
  origem: string;
  destino: string;
  base: Base;
}

interface Operacao {
  id: number;
  saida: string;
  servico: string;
  frota: string;
  placa: string;
  motoristaNome: string;
  motoristaMat: string;
  linha: string;
  localizacao: string;
  previsaoITZ: string;
  turno: Turno;
  lat?: number;
  lng?: number;
}

// ─── Constants ─────────────────────────────────────────────────────────────
const BACKEND_URL = typeof window !== "undefined" 
  ? `http://${window.location.hostname}:8080` 
  : "http://localhost:8080";

const now = new Date();
const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

const baseLabels: Record<Base, { label: string; short: string }> = {
  IMP: { label: "Imperatriz", short: "IMP" },
  SLZ: { label: "São Luís", short: "SLZ" },
  BEL: { label: "Belém", short: "BEL" },
};


// ─── Helpers ────────────────────────────────────────────────────────────────
const inputClass =
  "w-full rounded-xl px-4 py-3 text-sm outline-none transition-all border focus:border-blue-500 " +
  "bg-[var(--secondary)] border-[var(--border)] text-[var(--foreground)] placeholder:text-muted";

const selectClass =
  "w-full rounded-xl px-4 py-3 text-sm outline-none transition-all border focus:border-blue-500 appearance-none " +
  "bg-[var(--secondary)] border-[var(--border)] text-[var(--foreground)]";

// ─── Posicionamento Modal ────────────────────────────────────────────────────
function PosModal({
  open,
  initial,
  base,
  onClose,
  onSave,
}: {
  open: boolean;
  initial?: Partial<Posicionamento>;
  base: Base;
  onClose: () => void;
  onSave: (p: Omit<Posicionamento, "id">) => void;
}) {
  const [frota, setFrota] = useState(initial?.frota ?? "");
  const [horario, setHorario] = useState(initial?.horario ?? "");
  const [origem, setOrigem] = useState(initial?.origem ?? base);
  const [destino, setDestino] = useState(initial?.destino ?? "");

  if (!open) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ data: today, frota, horario, origem, destino, base });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="glass w-full max-w-md p-8 rounded-3xl z-10 relative" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">
            {initial?.id ? "Editar" : "Novo"} Posicionamento —{" "}
            <span className="text-blue-500">{baseLabels[base].label}</span>
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--secondary)] text-muted">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted">Frota / "CANCELADO"</label>
              <input value={frota} onChange={(e) => setFrota(e.target.value.toUpperCase())} placeholder="Ex: 1042" className={inputClass} required />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted">Horário</label>
              <input type="time" value={horario} onChange={(e) => setHorario(e.target.value)} className={inputClass} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted">Origem</label>
              <div className="relative">
                <select value={origem} onChange={(e) => setOrigem(e.target.value)} className={selectClass}>
                  {(["IMP", "SLZ", "BEL"] as Base[]).map((b) => <option key={b} value={b}>{baseLabels[b].label}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted">Destino</label>
              <div className="relative">
                <select value={destino} onChange={(e) => setDestino(e.target.value)} className={selectClass}>
                  <option value="">Selecione...</option>
                  {(["IMP", "SLZ", "BEL"] as Base[]).map((b) => <option key={b} value={b}>{baseLabels[b].label}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
              </div>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-[var(--border)] text-sm font-semibold hover:bg-[var(--secondary)] transition-colors">Cancelar</button>
            <button type="submit" className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Operação Modal ──────────────────────────────────────────────────────────
function OpModal({
  open,
  initial,
  turno,
  onClose,
  onSave,
}: {
  open: boolean;
  initial?: Partial<Operacao>;
  turno: Turno;
  onClose: () => void;
  onSave: (o: Omit<Operacao, "id">) => void;
}) {
  const [saida, setSaida] = useState(initial?.saida ?? "");
  const [servico, setServico] = useState(initial?.servico ?? "LINHA");
  const [frota, setFrota] = useState(initial?.frota ?? "");
  const [placa, setPlaca] = useState(initial?.placa ?? "");
  const [motoristaNome, setMotoristaNome] = useState(initial?.motoristaNome ?? "");
  const [motoristaMat, setMotoristaMat] = useState(initial?.motoristaMat ?? "");
  const [linha, setLinha] = useState(initial?.linha ?? "");
  const [localizacao, setLocalizacao] = useState(initial?.localizacao ?? "");
  const [previsaoITZ, setPrevisaoITZ] = useState(initial?.previsaoITZ ?? "");

  if (!open) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ 
      saida, 
      servico, 
      frota, 
      placa, 
      motoristaNome: motoristaNome.toUpperCase(), 
      motoristaMat, 
      linha, 
      localizacao: localizacao.toUpperCase(),
      previsaoITZ,
      turno 
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="glass w-full max-w-lg p-8 rounded-3xl z-10 relative" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">
            {initial?.id ? "Editar" : "Nova"} Operação —{" "}
            <span className={turno === "DIURNO" ? "text-amber-500" : "text-indigo-400"}>
              {turno === "DIURNO" ? "Diurna" : "Noturna"}
            </span>
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--secondary)] text-muted">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted">Saída</label>
              <input type="time" value={saida} onChange={(e) => setSaida(e.target.value)} className={inputClass} required />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted">Serviço</label>
              <div className="relative">
                <select value={servico} onChange={(e) => setServico(e.target.value)} className={selectClass}>
                  <option>LINHA</option>
                  <option>FRETAMENTO</option>
                  <option>RESERVA</option>
                  <option>MANUTENÇÃO</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted">Frota</label>
              <input value={frota} onChange={(e) => setFrota(e.target.value)} placeholder="Ex: 1042" className={inputClass} required />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted">Placa</label>
              <input value={placa} onChange={(e) => setPlaca(e.target.value.toUpperCase())} placeholder="Ex: NDB-3421" className={inputClass} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted">Motorista (Nome)</label>
              <input value={motoristaNome} onChange={(e) => setMotoristaNome(e.target.value)} placeholder="Nome completo" className={inputClass} required />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted">Matrícula</label>
              <input value={motoristaMat} onChange={(e) => setMotoristaMat(e.target.value)} placeholder="Ex: 081234" className={inputClass} required />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted">Linha / Serviço</label>
            <input value={linha} onChange={(e) => setLinha(e.target.value)} placeholder="Ex: Linha 02 - Imperatriz/São Luís" className={inputClass} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted">Localização Atual</label>
              <input value={localizacao} onChange={(e) => setLocalizacao(e.target.value)} placeholder="Ex: Entroncamento" className={inputClass} required />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted">Previsão (ITZ)</label>
              <input value={previsaoITZ} onChange={(e) => setPrevisaoITZ(e.target.value)} placeholder="Ex: 04:30 ou GARAGEM" className={inputClass} required />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-[var(--border)] text-sm font-semibold hover:bg-[var(--secondary)] transition-colors">Cancelar</button>
            <button type="submit" className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Location Cell Component ────────────────────────────────────────────────
function LocationCell({ initial, prefixo }: { initial: string; prefixo: string }) {
  const [location, setLocation] = useState(initial);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Se já tiver um dado real (não for placeholder e não for vazio), não faz nada
    if (initial && initial !== "N/I" && initial !== "NÃO ENCONTRADO" && initial !== "OPERANDO") {
      setLocation(initial);
      return;
    }

    // Caso contrário, tenta resolver sob demanda igual à escala do fluxo
    async function resolve() {
      if (!prefixo || prefixo === "N/I" || prefixo.toUpperCase() === "CANCELADO") return;
      
      setLoading(true);
      try {
        const token = localStorage.getItem("sisget_token");
        const BACKEND_URL = typeof window !== "undefined" 
          ? `http://${window.location.hostname}:8080` 
          : "http://localhost:8080";

        const res = await fetch(`${BACKEND_URL}/api/search/geocoding/vehicle/${prefixo.trim()}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          if (data && data.city && data.city !== "Local Indeterminado") {
            setLocation(data.city.toUpperCase());
          } else {
            setLocation("OPERANDO");
          }
        }
      } catch (err) {
        console.error("Erro no LocationCell:", err);
      } finally {
        setLoading(false);
      }
    }

    resolve();
  }, [initial, prefixo]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-blue-500/50">
        <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
        <span className="text-[10px] font-bold animate-pulse">RESOLVENDO...</span>
      </div>
    );
  }

  const isNi = location === "N/I" || location === "NÃO ENCONTRADO";
  
  return (
    <span className={`whitespace-nowrap ${isNi ? "text-muted" : "text-blue-500 font-bold"}`}>
      {location}
    </span>
  );
}

// ─── Posicionamento Tab ──────────────────────────────────────────────────────
function PosTab({ data }: { data: Posicionamento[] }) {
  const [localPos, setLocalPos] = useState<Posicionamento[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalBase, setModalBase] = useState<Base>("IMP");
  const [editing, setEditing] = useState<Posicionamento | undefined>();

  // Merges API data with any local overrides/adds (if we implement persistence later)
  // For now, we prioritize API data
  const currentPos = data; 

  const byBase = (b: Base) => currentPos.filter((p) => p.base === b);

  const handleSave = (pData: Omit<Posicionamento, "id">) => {
    // Note: In an SDD environment, this should hit an API.
    // For now, we just update the UI state if needed, but the objective is 
    // to bring the database to life.
    setModalOpen(false);
  };

  const openNew = (base: Base) => { setModalBase(base); setEditing(undefined); setModalOpen(true); };
  const openEdit = (p: Posicionamento) => { setModalBase(p.base); setEditing(p); setModalOpen(true); };
  const del = (id: number) => { /* implementation */ };

  const legend = [
    { label: "Carro Reserva", color: "bg-emerald-500" },
    { label: "Grade Futura", color: "bg-amber-500" },
    { label: "Indisponível", color: "bg-red-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {(["IMP", "SLZ", "BEL"] as Base[]).map((base) => (
          <div key={base} className="glass rounded-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-500" />
                <h3 className="font-bold text-sm">{baseLabels[base].label}</h3>
                <span className="text-xs font-bold bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full">
                  {byBase(base).length}
                </span>
              </div>
              <button onClick={() => openNew(base)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <table className="w-full text-xs flex-1">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left px-4 py-2.5 text-muted font-bold uppercase tracking-wider">Frota</th>
                  <th className="text-left px-4 py-2.5 text-muted font-bold uppercase tracking-wider">Horário</th>
                  <th className="text-left px-4 py-2.5 text-muted font-bold uppercase tracking-wider">Destino</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {byBase(base).length === 0 ? (
                  <tr><td colSpan={4} className="py-8 text-center text-muted">Nenhum posicionamento</td></tr>
                ) : (
                  byBase(base).map((p) => {
                    const isCancelado = p.frota === "CANCELADO";
                    return (
                      <tr key={p.id} className={`group transition-colors ${isCancelado ? "bg-red-500/10" : "hover:bg-[var(--secondary)]"}`}>
                        <td className={`px-4 py-3 font-bold font-mono ${isCancelado ? "text-red-500" : ""}`}>{p.frota}</td>
                        <td className="px-4 py-3 text-muted">{p.horario}</td>
                        <td className="px-4 py-3 font-semibold">{p.destino}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEdit(p)} className="w-6 h-6 flex items-center justify-center rounded hover:bg-blue-500/10 text-blue-500">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => del(p.id)} className="w-6 h-6 flex items-center justify-center rounded hover:bg-red-500/10 text-red-500">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            <div className="px-4 py-3 border-t border-[var(--border)] flex items-center gap-3 flex-wrap">
              {legend.map((l) => (
                <div key={l.label} className="flex items-center gap-1.5 text-[10px] font-semibold text-muted">
                  <div className={`w-2 h-2 rounded-full ${l.color}`} />
                  {l.label}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <PosModal open={modalOpen} initial={editing} base={modalBase} onClose={() => setModalOpen(false)} onSave={handleSave} />
    </div>
  );
}

// ─── Operação Tab ────────────────────────────────────────────────────────────
function OpTab({ data, occurrences, lastSync }: { data: Operacao[], occurrences: any[], lastSync: string }) {
  const [turno, setTurno] = useState<Turno>("DIURNO");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Operacao | undefined>();

  const filtered = data.filter((o) => o.turno === turno);

  const handleSave = (oData: Omit<Operacao, "id">) => {
    setModalOpen(false);
  };

  const openEdit = (o: Operacao) => { setEditing(o); setModalOpen(true); };
  const del = (id: number) => { /* implementation */ };

  const lateralResumo = {
    carrosReserva: ["--"],
    pneus: ["--"],
    ocorrencias: occurrences.map(o => ({ 
      car: o.vehicleId, 
      text: o.occurrenceText || "Sem descrição" 
    })),
    outros: ["--"],
  };

  return (
    <div className="flex gap-6">
      {/* Main table */}
      <div className="flex-1 space-y-4 min-w-0">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex rounded-xl border border-[var(--border)] overflow-hidden text-sm font-bold">
            {(["DIURNO", "NOTURNO"] as Turno[]).map((t) => (
              <button key={t} onClick={() => setTurno(t)} className={`flex items-center gap-2 px-5 py-2.5 transition-colors ${turno === t ? (t === "DIURNO" ? "bg-amber-500 text-white" : "bg-indigo-600 text-white") : "text-muted hover:bg-[var(--secondary)]"}`}>
                {t === "DIURNO" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {t === "DIURNO" ? "Diurna" : "Noturna"}
              </button>
            ))}
          </div>
          <div /> {/* Espaçador para manter o alinhamento do seletor de turno */}
        </div>

        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--secondary)]/30">
                  {["Saída", "Serviço", "Frota", "Placa", "Motorista", "Mat.", "Linha", "Localização", "Previsão"].map((h) => (
                    <th key={h} className="text-left px-3 py-3 text-[10px] font-bold text-muted uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                  <th className="px-3 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-16 text-center text-muted">
                      <div className="flex flex-col items-center gap-2">
                        <BusFront className="w-8 h-8 opacity-30" />
                        <span>Nenhuma operação registrada</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((o) => (
                    <tr key={o.id} className="hover:bg-[var(--secondary)] transition-colors group">
                      <td className="px-3 py-2.5 font-bold font-mono whitespace-nowrap">{o.saida}</td>
                      <td className="px-3 py-2.5">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-lg bg-blue-500/10 text-blue-500">{o.servico}</span>
                      </td>
                      <td className="px-3 py-2.5 font-bold whitespace-nowrap">{o.frota}</td>
                      <td className="px-3 py-2.5 text-muted font-mono whitespace-nowrap text-xs">{o.placa}</td>
                      <td className="px-3 py-2.5 font-medium whitespace-nowrap text-xs">{o.motoristaNome}</td>
                      <td className="px-3 py-2.5 text-muted font-mono text-xs">{o.motoristaMat}</td>
                      <td className="px-3 py-2.5 text-muted max-w-[180px]">
                        <p className="truncate text-[11px]">{o.linha}</p>
                      </td>
                      <td className="px-3 py-2.5">
                        <LocationCell initial={o.localizacao} prefixo={o.frota} />
                      </td>
                      <td className="px-3 py-2.5 font-mono text-[10px] whitespace-nowrap">{o.previsaoITZ}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEdit(o)} className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-blue-500/10 text-blue-500">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => del(o.id)} className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-red-500">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Informativo Localizado */}
        <div className="flex items-center justify-between text-xs font-bold text-muted pt-2">
          <div className="flex items-center gap-3 px-4 py-2 bg-[var(--secondary)] rounded-xl border border-[var(--border)] text-blue-500">
            <Calendar className="w-4 h-4" />
            <span className="uppercase tracking-wider">Escala: {today}</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-[var(--secondary)] rounded-xl border border-[var(--border)] text-emerald-500">
            <Clock className="w-4 h-4" />
            <span className="uppercase tracking-wider">Sincronia GPS: {lastSync}</span>
          </div>
        </div>
      </div>

      {/* Lateral resume */}
      <div className="w-64 flex-shrink-0 space-y-4">
        {[
          { title: "Carros Reserva", icon: Car, color: "text-emerald-500", bg: "bg-emerald-500/10", items: lateralResumo.carrosReserva },
          { title: "Pneus", icon: Wrench, color: "text-amber-500", bg: "bg-amber-500/10", items: lateralResumo.pneus },
          { title: "Ocorrências", icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10", items: lateralResumo.ocorrencias },
          { title: "Outros", icon: FileText, color: "text-blue-500", bg: "bg-blue-500/10", items: lateralResumo.outros },
        ].map((section) => (
          <div key={section.title} className="glass rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-lg ${section.bg} flex items-center justify-center`}>
                <section.icon className={`w-4 h-4 ${section.color}`} />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted">{section.title}</h4>
            </div>
            <ul className="space-y-1.5">
              {section.items.map((item, i) => {
                const isOccurrence = typeof item === "object" && item !== null && 'car' in item;
                
                if (isOccurrence) {
                  return (
                    <li key={i} className="group">
                      <details className="cursor-pointer group">
                        <summary className="text-sm font-bold text-blue-500 hover:text-blue-600 flex items-center justify-between list-none pl-1 border-l-2 border-blue-500/30 group-hover:border-blue-500 transition-colors">
                          <span className="tracking-tight">{item.car}</span>
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-0 group-open:opacity-100 transition-opacity" />
                        </summary>
                        <div className="mt-2 p-3 rounded-lg bg-[var(--secondary)]/50 text-xs leading-relaxed text-muted border border-[var(--border)] animate-in slide-in-from-top-1 duration-200">
                          {item.text}
                        </div>
                      </details>
                    </li>
                  );
                }

                return (
                  <li key={i} className="text-sm font-medium pl-1 border-l-2 border-[var(--border)]">
                    {String(item)}
                  </li>
                );
              })}
              {section.items.length === 0 && <li className="text-xs text-muted italic">Nenhum</li>}
            </ul>
          </div>
        ))}
      </div>

      <OpModal open={modalOpen} initial={editing} turno={turno} onClose={() => setModalOpen(false)} onSave={handleSave} />
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
type PageTab = "posicionamento" | "operacao";

const today = new Date().toLocaleDateString("pt-BR");

export default function FleetPage() {
  const [tab, setTab] = useState<PageTab>("posicionamento");
  const [loading, setLoading] = useState(true);
  const [rawEscala, setRawEscala] = useState<any[]>([]);
  const [occurrences, setOccurrences] = useState<any[]>([]);
  const [fleetTracking, setFleetTracking] = useState<any[]>([]);
  const [lastSync, setLastSync] = useState("-");

  useEffect(() => {
    async function loadData() {
      try {
        const token = localStorage.getItem("sisget_token");
        const headers = { "Authorization": `Bearer ${token}` };

        // 1. Escala
        const resEscala = await fetch(`${BACKEND_URL}/api/escalas?data=${todayStr}`, { headers });
        if (resEscala.ok) {
          setRawEscala(await resEscala.json());
        }

        // 2. Ocorrências
        const resOcc = await fetch(`${BACKEND_URL}/api/fleet/occurrences`, { headers });
        if (resOcc.ok) {
          setOccurrences(await resOcc.json());
        }

        // 3. Rastreamento (Latest)
        const resFleet = await fetch(`${BACKEND_URL}/api/fleet/latest`, { headers });
        if (resFleet.ok) {
          const body = await resFleet.json();
          setFleetTracking(body.fleet || []);
          setLastSync(body.lastSync || "-");
        }
      } catch (err) {
        console.error("Erro ao sincronizar dados:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // ─── Mapping API -> Operacao ───────────────────────────────────────────────
  const mappedOperacoes: Operacao[] = rawEscala
    .filter((item) => (item.origem || "").toUpperCase().includes("IMPERATRIZ"))
    .map((item, idx) => {
    // Horário de teste para turno - Garantindo que trate string "18:30:00" ou similar
    const hSaidaStr = String(item.horarioSaida || "0");
    const hora = parseInt(hSaidaStr.split(":")[0]) || 0;
    const turno: Turno = (hora >= 18 || hora < 5) ? "NOTURNO" : "DIURNO";

    // Split motorista "NOME - MATRICULA"
    const motParts = (item.motorista || "").split("-");
    const nome = motParts[0]?.trim() || "N/I";
    const mat = motParts[1]?.trim() || "";

    // Busca localização no tracking com trim para evitar falhas por espaços
    const tracking = fleetTracking.find(
      (f) => (f.vehicleId || "").trim() === (item.carro || "").trim(),
    );
    
    let localizacao = "N/I";
    const carUpper = (item.carro || "").toUpperCase();

    if (carUpper.includes("CANCELADO")) {
      localizacao = "CANCELADO";
    } else if (!tracking) {
      localizacao = "NÃO ENCONTRADO";
    } else {
      const isStopped = (tracking.speed || 0) === 0;
      const addr = (tracking.cityLocation || "").toUpperCase();
      
      // Se estiver parado e o endereço sugerir garagem
      if (isStopped && (addr.includes("GARAGEM"))) {
        localizacao = "GARAGEM";
      } else {
        // Foco total nos endereços (cityLocation) conforme solicitado, ignorando MCR
        localizacao = tracking.cityLocation || "OPERANDO";
      }
    }

    return {
      id: item.id || idx,
      saida: (item.horarioSaida || "--:--").substring(0, 5),
      servico: item.servico || "LINHA",
      frota: item.carro || "N/I",
      placa: "--", // Não disponível na escala base
      motoristaNome: nome,
      motoristaMat: mat,
      linha: item.linha || item.trecho || "N/I",
      localizacao: localizacao.toUpperCase(),
      previsaoITZ: "--", 
      turno,
      lat: tracking?.latitude,
      lng: tracking?.longitude
    };
  });

  // ─── Mapping API -> Posicionamento ─────────────────────────────────────────
  const mappedPos: Posicionamento[] = rawEscala.map((item, idx) => {
    const baseRaw = (item.garagem || "").toUpperCase();
    let base: Base = "IMP";
    if (baseRaw.includes("SLZ") || baseRaw.includes("LUIS")) base = "SLZ";
    else if (baseRaw.includes("BEL")) base = "BEL";

    return {
      id: item.id || idx,
      data: today,
      frota: item.carro || "N/I",
      horario: (item.horarioSaida || "--:--").substring(0, 5),
      origem: item.origem || "N/I",
      destino: item.destino || "N/I",
      base
    };
  });

  return (
    <div className="space-y-8 w-full max-w-[1800px] mx-auto px-4 lg:px-8">
      {/* Page Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-bold text-muted uppercase tracking-widest mb-1">Módulo</p>
          <h1 className="text-3xl font-black tracking-tight" style={{ fontFamily: "var(--font-outfit)" }}>
            Controle de Frota
          </h1>
        </div>
        <div />
      </div>

      {/* Tab Switcher */}
      <div className="flex rounded-2xl border border-[var(--border)] overflow-hidden w-fit text-sm font-bold">
        <button
          onClick={() => setTab("posicionamento")}
          className={`flex items-center gap-2 px-6 py-3 transition-colors ${tab === "posicionamento" ? "bg-blue-600 text-white" : "text-muted hover:bg-[var(--secondary)]"}`}
        >
          <MapPin className="w-4 h-4" />
          Posicionamento
        </button>
        <button
          onClick={() => setTab("operacao")}
          className={`flex items-center gap-2 px-6 py-3 transition-colors ${tab === "operacao" ? "bg-blue-600 text-white" : "text-muted hover:bg-[var(--secondary)]"}`}
        >
          <BusFront className="w-4 h-4" />
          Operação
        </button>
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 glass rounded-3xl">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-muted font-bold">Sincronizando com a Base de Dados...</p>
        </div>
      ) : (
        tab === "posicionamento" ? <PosTab data={mappedPos} /> : <OpTab data={mappedOperacoes} occurrences={occurrences} lastSync={lastSync} />
      )}
    </div>
  );
}
