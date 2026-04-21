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
  Calendar,
  FileText,
  Clock,
  Sun,
  Moon,
  AlertCircle,
  Send,
  Trash
} from "lucide-react";
import { toast } from "sonner";

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

interface StaticPos {
  id: number;
  vehicleId: string;
  base: Base;
  category: "RESERVA" | "GRADE" | "INDISPONIVEL" | "FRETAMENTO";
  schedule?: string;
  origin?: string;
  destination?: string;
  endDate?: string;
  notes?: string;
  scheduledDate?: string;
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
  distance?: number;
}

interface FleetNote {
  id: number;
  text: string;
  createdAt: string;
}

// ─── Constants ─────────────────────────────────────────────────────────────
const BACKEND_URL = typeof window !== "undefined" 
  ? `http://${window.location.hostname}:8080` 
  : "http://localhost:8080";

const now = new Date();
const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
const todayDisplay = now.toLocaleDateString("pt-BR");

const baseLabels: Record<Base, { label: string; short: string }> = {
  IMP: { label: "Imperatriz", short: "IMP" },
  SLZ: { label: "São Luís", short: "SLZ" },
  BEL: { label: "Belém", short: "BEL" },
};

const inputClass = "w-full rounded-xl px-4 py-3 text-sm outline-none transition-all border focus:border-blue-500 bg-[var(--secondary)] border-[var(--border)] text-[var(--foreground)] placeholder:text-muted";
const selectClass = "w-full rounded-xl px-4 py-3 text-sm outline-none transition-all border focus:border-blue-500 appearance-none bg-[var(--secondary)] border-[var(--border)] text-[var(--foreground)]";

// ─── Helpers ────────────────────────────────────────────────────────────────
const formatDate = (dateStr: string) => {
  if (!dateStr || dateStr === "N/I") return dateStr;
  const parts = dateStr.split("-");
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return dateStr;
};

// ─── Posicionamento Modal ────────────────────────────────────────────────────
function PosModal({ 
  open, initial, base, category, onClose, onSave, onSaveStatic 
}: { 
  open: boolean; initial?: Partial<Posicionamento>; base: Base; category: string;
  onClose: () => void; onSave: (p: Omit<Posicionamento, "id">) => void; onSaveStatic: (s: Omit<StaticPos, "id">) => void;
}) {
  const [frota, setFrota] = useState(initial?.frota ?? "");
  const [horario, setHorario] = useState(initial?.horario ?? "");
  const [origem, setOrigem] = useState(initial?.origem ?? base);
  const [destino, setDestino] = useState(initial?.destino ?? "");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");

  if (!open) return null;

  const isStatic = category !== "FLOW";
  const isFretamento = category === "FRETAMENTO";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isStatic) {
      onSaveStatic({ 
        vehicleId: frota, base, category: category as any,
        endDate: isFretamento ? endDate : undefined,
        notes: isFretamento ? notes : undefined,
        origin: origem, destination: destino,
        scheduledDate: category === "GRADE" ? scheduledDate : undefined
      });
    } else {
      onSave({ data: todayStr, frota, horario, origem, destino, base });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="glass w-full max-w-md p-8 rounded-3xl z-10 relative" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">
            {initial?.id ? "Editar" : "Novo"} Posicionamento — <span className="text-blue-500">{baseLabels[base].label}</span>
          </h2>
          <button type="button" onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--secondary)] text-muted">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 font-bold">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted">Categoria</label>
              <div className="py-2.5 px-4 bg-blue-500/10 rounded-xl border border-blue-500/30 text-blue-500 text-xs font-black uppercase">
                {category === "FLOW" ? "VIAGEM EM CURSO" : category}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted">Frota</label>
              <input value={frota} onChange={(e) => setFrota(e.target.value.toUpperCase())} placeholder="Ex: 1042" className={inputClass} required />
            </div>
          </div>

          {!isStatic && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted">Horário Saída</label>
              <input type="time" value={horario} onChange={(e) => setHorario(e.target.value)} className={inputClass} required />
            </div>
          )}

          {category === "GRADE" && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-blue-500">Quando (Data/Hora)</label>
              <input type="datetime-local" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} className={inputClass} required />
            </div>
          )}

          {isFretamento && (
            <div className="space-y-4 pt-2 border-t border-[var(--border)]">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-blue-500">Data Final Prevista</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClass} required />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-blue-500">Observações</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className={`${inputClass} resize-none h-20`} placeholder="Detalhes..." />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted">Origem</label>
              <div className="relative">
                {isFretamento ? (
                  <input value={origem} onChange={(e) => setOrigem(e.target.value.toUpperCase())} placeholder="Ex: Garagem IMP" className={inputClass} required />
                ) : (
                  <>
                    <select value={origem} onChange={(e) => setOrigem(e.target.value)} className={selectClass}>
                      {(["IMP", "SLZ", "BEL"] as Base[]).map((b) => <option key={b} value={b}>{baseLabels[b].label}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                  </>
                )}
              </div>
            </div>
            {(isFretamento || !isStatic) && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted">Destino</label>
                <div className="relative">
                  {isFretamento ? (
                    <input value={destino} onChange={(e) => setDestino(e.target.value.toUpperCase())} placeholder="Ex: Local de Obra" className={inputClass} required />
                  ) : (
                    <>
                      <select value={destino} onChange={(e) => setDestino(e.target.value)} className={selectClass} required>
                        <option value="">Selecione...</option>
                        {(["IMP", "SLZ", "BEL"] as Base[]).map((b) => <option key={b} value={b}>{baseLabels[b].label}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                    </>
                  )}
                </div>
              </div>
            )}
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
  open, initial, turno, onClose, onSave 
}: { 
  open: boolean; initial?: Partial<Operacao>; turno: Turno; onClose: () => void; onSave: (o: Omit<Operacao, "id">) => void;
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
    onSave({ saida, servico, frota, placa, motoristaNome: motoristaNome.toUpperCase(), motoristaMat, linha, localizacao: localizacao.toUpperCase(), previsaoITZ, turno });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="glass w-full max-w-lg p-8 rounded-3xl z-10 relative" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">
            {initial?.id ? "Editar" : "Nova"} Operação — <span className={turno === "DIURNO" ? "text-amber-500" : "text-indigo-400"}>{turno === "DIURNO" ? "Diurna" : "Noturna"}</span>
          </h2>
          <button type="button" onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--secondary)] text-muted">
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
                  <option>LINHA</option><option>FRETAMENTO</option><option>RESERVA</option><option>MANUTENÇÃO</option>
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
              <input value={placa} onChange={(e) => setPlaca(e.target.value.toUpperCase())} placeholder="NDB-3421" className={inputClass} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted">Motorista</label>
              <input value={motoristaNome} onChange={(e) => setMotoristaNome(e.target.value)} placeholder="Nome" className={inputClass} required />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted">Matrícula</label>
              <input value={motoristaMat} onChange={(e) => setMotoristaMat(e.target.value)} placeholder="Ex: 081234" className={inputClass} required />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted">Linha / Serviço</label>
            <input value={linha} onChange={(e) => setLinha(e.target.value)} placeholder="Linha 02 - ITZ/SLZ" className={inputClass} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted">Localização</label>
              <input value={localizacao} onChange={(e) => setLocalizacao(e.target.value)} placeholder="Ex: Entroncamento" className={inputClass} required />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted">Previsão (ITZ)</label>
              <input value={previsaoITZ} onChange={(e) => setPrevisaoITZ(e.target.value)} placeholder="Ex: 04:30" className={inputClass} required />
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
    if (initial && initial !== "N/I" && initial !== "NÃO ENCONTRADO" && initial !== "OPERANDO") {
      setLocation(initial);
      return;
    }

    async function resolve() {
      if (!prefixo || prefixo === "N/I" || prefixo.toUpperCase() === "CANCELADO") return;
      setLoading(true);
      try {
        const token = localStorage.getItem("sisget_token");
        const res = await fetch(`${BACKEND_URL}/api/search/geocoding/vehicle/${prefixo.trim()}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setLocation(data?.city?.toUpperCase() || "OPERANDO");
        }
      } catch (err) { console.error(err); } finally { setLoading(false); }
    }
    resolve();
  }, [initial, prefixo]);

  if (loading) return <div className="flex items-center gap-2 text-blue-500/50"><div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" /><span className="text-[10px] font-bold">RESOLVENDO...</span></div>;
  const isNi = location === "N/I" || location === "NÃO ENCONTRADO";
  return <span className={`whitespace-nowrap ${isNi ? "text-muted" : "text-blue-500 font-bold"}`}>{location}</span>;
}

// ─── Confirm Modal ───────────────────────────────────────────────────────────
function ConfirmModal({ 
  open, title, message, onConfirm, onClose 
}: { 
  open: boolean; title: string; message: string; onConfirm: () => void; onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div className="glass w-full max-w-sm p-8 rounded-3xl z-10 relative border-red-500/20">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 mb-2">
            <Trash2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black tracking-tight">{title}</h2>
          <p className="text-sm text-muted font-medium mb-4">{message}</p>
          <div className="flex gap-3 w-full">
            <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-[var(--border)] text-sm font-bold hover:bg-[var(--secondary)] transition-colors">Cancelar</button>
            <button onClick={onConfirm} className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-lg shadow-red-500/20 transition-all active:scale-95">Excluir</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Posicionamento Tab ──────────────────────────────────────────────────────
function PosTab({ data, staticData, duplicates }: { data: Posicionamento[]; staticData: StaticPos[]; duplicates: Set<string>; }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalBase, setModalBase] = useState<Base>("IMP");
  const [modalCategory, setModalCategory] = useState("FLOW");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState<number | null>(null);

  const byBase = (b: Base) => data.filter(p => p.base === b).sort((a,b) => (a.origem||"").localeCompare(b.origem||""));

  const handleSaveStatic = async (sData: Omit<StaticPos, "id">) => {
    const tid = toast.loading("Salvando registro...");
    try {
      const token = localStorage.getItem("sisget_token");
      const res = await fetch(`${BACKEND_URL}/api/fleet/static-pos`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(sData),
      });
      if (res.ok) {
        toast.success("Salvo com sucesso!", { id: tid });
        setTimeout(() => window.location.reload(), 800);
      } else {
        toast.error("Erro ao salvar.", { id: tid });
      }
    } catch (err) { 
      toast.error("Erro de conexão.", { id: tid });
    }
  };

  const delStatic = async (id: number) => {
    const tid = toast.loading("Excluindo registro...");
    try {
      const token = localStorage.getItem("sisget_token");
      const res = await fetch(`${BACKEND_URL}/api/fleet/static-pos/${id}`, {
        method: "DELETE",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (res.ok) {
        toast.success("Registro removido!", { id: tid });
        setTimeout(() => window.location.reload(), 800);
      } else {
        const errorText = await res.text();
        toast.error("Erro: " + errorText, { id: tid });
      }
    } catch (err) { 
      toast.error("Erro de conexão ao excluir.", { id: tid });
    } finally {
      setConfirmOpen(false);
      setToDeleteId(null);
    }
  };

  const confirmDelete = (id: number) => {
    setToDeleteId(id);
    setConfirmOpen(true);
  };

  const openNew = (base: Base, category: string = "FLOW") => {
    setModalBase(base);
    setModalCategory(category);
    setModalOpen(true);
  };

  const getStatic = (base: Base, category: string) => staticData.filter(s => s.base === base && s.category === category);

  const legend = [
    { key: "RESERVA", label: "Carro Reserva", color: "bg-emerald-500" },
    { key: "GRADE", label: "Grade Futura", color: "bg-amber-500" },
    { key: "INDISPONIVEL", label: "Indisponível", color: "bg-red-500" },
  ];

  return (
    <div className="w-full">
      <div className="overflow-x-auto pb-6 custom-scrollbar -mx-4 px-4 lg:-mx-8 lg:px-8">
        <div className="flex gap-6 min-w-max pb-2 justify-start lg:justify-center">
        {(["IMP", "SLZ", "BEL"] as Base[]).map((base) => (
          <div key={base} className="glass rounded-2xl overflow-hidden flex flex-col w-[550px] flex-shrink-0">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20"><MapPin className="w-5 h-5" /></div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-tight text-blue-500">{baseLabels[base].label}</h3>
                  <p className="text-[10px] text-muted font-bold uppercase tracking-widest">Posicionamento Estrito</p>
                </div>
              </div>
            </div>
            <table className="w-full text-xs flex-1">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--secondary)]/30">
                  <th className="text-left px-4 py-2.5 text-muted font-bold text-[9px] uppercase">Data</th>
                  <th className="text-left px-4 py-2.5 text-muted font-bold text-[9px] uppercase">Frota</th>
                  <th className="text-left px-4 py-2.5 text-muted font-bold text-[9px] uppercase">Horário</th>
                  <th className="text-left px-4 py-2.5 text-muted font-bold text-[9px] uppercase">Origem</th>
                  <th className="text-left px-4 py-2.5 text-muted font-bold text-[9px] uppercase">Destino</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {byBase(base).map((p) => {
                  const isCancelled = (p.frota || "").toUpperCase().includes("CANCELADO");
                  return (
                    <tr key={p.id} className={`hover:bg-[var(--secondary)]/30 transition-colors ${duplicates.has(p.frota) ? "bg-amber-500/10" : ""} ${isCancelled ? "bg-red-500/10" : ""}`}>
                      <td className="px-4 py-2.5 font-bold text-muted whitespace-nowrap">{formatDate(p.data)}</td>
                      <td className={`px-4 py-2.5 font-black font-mono ${isCancelled ? "text-red-500" : (duplicates.has(p.frota) ? "text-amber-500" : "text-blue-500")}`}>{p.frota}</td>
                      <td className={`px-4 py-2.5 font-bold ${isCancelled ? "text-red-400" : ""}`}>{p.horario}</td>
                      <td className="px-4 py-2.5 text-muted uppercase font-bold text-[10px]">{p.origem}</td>
                      <td className="px-4 py-2.5 text-muted uppercase font-bold text-[10px]">{p.destino}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            <div className="p-5 bg-[var(--secondary)]/20 space-y-4">
              <div className="grid grid-cols-1 gap-3">
                {legend.map((l) => (
                  <div key={l.key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-4 ${l.color} rounded-full`} />
                        <span className="text-[11px] font-black uppercase text-muted tracking-widest">{l.label}</span>
                      </div>
                      <button type="button" onClick={() => openNew(base, l.key)} className="p-1 hover:text-blue-500 transition-colors"><Plus className="w-4 h-4" /></button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {getStatic(base, l.key).length === 0 ? (
                        <span className="text-[10px] text-muted/50 italic">Nenhum veículo</span>
                      ) : (
                        getStatic(base, l.key).map(c => {
                          const display = (c.category === "GRADE" && c.scheduledDate) 
                            ? `${c.vehicleId} - ${new Date(c.scheduledDate).toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' })}`
                            : c.vehicleId;
                          return (
                            <div key={c.id} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-[10px] font-bold group transition-all ${duplicates.has(c.vehicleId) ? "bg-amber-500/20 border-amber-500 text-amber-600" : "bg-[var(--secondary)] border-[var(--border)]"}`}>
                              <span>{display}</span>
                              <button type="button" onClick={() => confirmDelete(c.id)} className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all ml-1"><X className="w-3 h-3" /></button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 border-t border-[var(--border)] pt-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-[11px] font-black uppercase text-blue-500 tracking-widest flex items-center gap-2"><FileText className="w-4 h-4" />Fretamento em Andamento</h4>
                  <button type="button" onClick={() => openNew(base, "FRETAMENTO")} className="text-blue-500 hover:text-blue-700 transition-colors"><Plus className="w-4 h-4" /></button>
                </div>
                {getStatic(base, "FRETAMENTO").length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-[10px]">
                      <thead>
                        <tr className="text-muted border-b border-[var(--border)]">
                          <th className="text-left py-1 font-bold">FROTA</th>
                          <th className="text-left py-1 font-bold">ORIGEM/DESTINO</th>
                          <th className="text-left py-1 font-bold">DATA FINAL</th>
                          <th className="text-right py-1 font-bold">AÇÃO</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getStatic(base, "FRETAMENTO").sort((a,b) => (a.origin||"").localeCompare(b.origin||"")).map(f => (
                          <tr key={f.id} className={`border-b border-[var(--border)]/50 hover:bg-[var(--secondary)]/30 group ${duplicates.has(f.vehicleId) ? "bg-amber-500/5" : ""}`}>
                            <td className={`py-2 font-black font-mono ${duplicates.has(f.vehicleId) ? "text-amber-500" : "text-blue-500"}`}>{f.vehicleId}</td>
                            <td className="py-2 text-muted uppercase font-bold">{f.origin || "-"} {"/"} {f.destination || "-"}</td>
                            <td className="py-2 text-indigo-400 font-bold whitespace-nowrap">{formatDate(f.endDate || "")}</td>
                            <td className="py-2 text-right">
                              <button type="button" onClick={() => confirmDelete(f.id)} className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        </div>
      </div>
      <PosModal open={modalOpen} base={modalBase} category={modalCategory} onClose={() => setModalOpen(false)} onSave={() => {}} onSaveStatic={handleSaveStatic} />
      
      <ConfirmModal 
        open={confirmOpen} 
        title="Excluir Registro" 
        message="Esta ação não pode ser desfeita. Deseja realmente remover este veículo da posição?" 
        onConfirm={() => toDeleteId && delStatic(toDeleteId)} 
        onClose={() => setConfirmOpen(false)} 
      />
    </div>
  );
}

// ─── Operação Tab ────────────────────────────────────────────────────────────
function OpTab({ data, occurrences, lastSync }: { data: Operacao[]; occurrences: any[]; lastSync: string; }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Operacao | undefined>();
  const [activeTurno, setActiveTurno] = useState<Turno>("DIURNO");
  
  const [notes, setNotes] = useState<FleetNote[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [newNote, setNewNote] = useState("");
  const [occModalOpen, setOccModalOpen] = useState(false);
  const [isNotesExpanded, setIsNotesExpanded] = useState(false);

  useEffect(() => {
    async function loadNotes() {
      try {
        const token = localStorage.getItem("sisget_token");
        const res = await fetch(`${BACKEND_URL}/api/fleet/notes`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) setNotes(await res.json());
      } catch (err) { console.error(err); } finally { setLoadingNotes(false); }
    }
    loadNotes();
  }, []);

  const addNote = async () => {
    if (!newNote.trim()) return;
    const tid = toast.loading("Registrando nota...");
    try {
      const token = localStorage.getItem("sisget_token");
      const res = await fetch(`${BACKEND_URL}/api/fleet/notes`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ text: newNote }),
      });
      if (res.ok) {
        const saved = await res.json();
        setNotes([saved, ...notes]);
        setNewNote("");
        toast.success("Nota registrada!", { id: tid });
      } else {
        toast.error("Erro ao salvar nota.", { id: tid });
      }
    } catch (err) { 
      toast.error("Erro de conexão.", { id: tid });
    }
  };

  const removeNote = async (id: number) => {
    const tid = toast.loading("Removendo nota...");
    try {
      const token = localStorage.getItem("sisget_token");
      const res = await fetch(`${BACKEND_URL}/api/fleet/notes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setNotes(notes.filter(n => n.id !== id));
        toast.success("Nota removida.", { id: tid });
      } else {
        toast.error("Erro ao excluir.", { id: tid });
      }
    } catch (err) { 
      toast.error("Erro de conexão.", { id: tid });
    }
  };

  const openEdit = (o: Operacao) => { setEditing(o); setModalOpen(true); };
  const filtered = data.filter(o => o.turno === activeTurno);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div 
          onClick={() => setOccModalOpen(true)}
          className="glass p-5 rounded-3xl border border-[var(--border)] flex items-center justify-between cursor-pointer hover:border-blue-500/50 transition-all group"
        >
          <div>
            <p className="text-[10px] font-black uppercase text-muted tracking-widest mb-1 group-hover:text-blue-500 transition-colors">Ocorrências Ativas</p>
            <p className="text-2xl font-black text-red-500">{occurrences.length}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform"><AlertCircle className="w-6 h-6" /></div>
        </div>
        
        <div className={`glass p-5 rounded-3xl border border-[var(--border)] flex flex-col gap-2 transition-all duration-500 ease-in-out ${isNotesExpanded ? "min-h-[250px]" : "h-[92px] overflow-hidden"}`}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" />
              <span className="text-[10px] font-black uppercase text-muted tracking-widest">Anotações da Operação</span>
            </div>
            <button 
              onClick={() => setIsNotesExpanded(!isNotesExpanded)}
              className={`p-1.5 rounded-lg text-blue-500 hover:bg-blue-500/10 transition-all duration-300 ${isNotesExpanded ? "rotate-180" : ""}`}
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          <div className={`transition-all duration-500 ease-in-out flex flex-col gap-3 ${isNotesExpanded ? "opacity-100" : "opacity-0"}`}>
            <div className="flex gap-2">
              <input 
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addNote()}
                placeholder="Adicionar nota..."
                className="flex-1 bg-[var(--secondary)] border border-[var(--border)] rounded-xl px-4 py-2 text-xs outline-none focus:border-blue-500 transition-colors"
                onFocus={() => setIsNotesExpanded(true)}
              />
              <button onClick={addNote} className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"><Send className="w-4 h-4" /></button>
            </div>
            
            <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1 custom-scrollbar">
              {notes.map(n => (
                <div key={n.id} className="p-3 rounded-xl bg-[var(--secondary)]/50 border border-[var(--border)] flex justify-between items-start group animation-slide-in">
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-[var(--foreground)]">{n.text}</p>
                    <span className="text-[9px] text-muted font-mono">
                      {n.createdAt ? new Date(n.createdAt).toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' }) : "--:--"}
                    </span>
                  </div>
                  <button onClick={() => removeNote(n.id)} className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-colors"><Trash2 className="w-3 h-3" /></button>
                </div>
              ))}
              {notes.length === 0 && <p className="text-[10px] text-muted italic text-center py-4">Nenhuma anotação registrada.</p>}
            </div>
          </div>
          
          {!isNotesExpanded && notes.length > 0 && (
             <p className="text-[11px] font-bold text-muted truncate">{notes[0].text}</p>
          )}
        </div>
      </div>

      <div className="flex gap-2 p-1.5 glass rounded-2xl w-fit border border-[var(--border)]">
        {(["DIURNO", "NOTURNO"] as Turno[]).map(t => (
          <button 
            key={t} 
            onClick={() => setActiveTurno(t)} 
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTurno === t 
                ? (t === "DIURNO" ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20" : "bg-blue-600 text-white shadow-lg shadow-blue-500/20") 
                : "text-muted hover:bg-[var(--secondary)]"
            }`}
          >
            {t === "DIURNO" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            {t}
          </button>
        ))}
      </div>

      <div className="-mx-4 px-4 lg:-mx-8 lg:px-8 overflow-x-auto custom-scrollbar pb-4">
        <div className="glass rounded-3xl overflow-hidden border border-[var(--border)] min-w-[1500px]">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--secondary)]/30">
                {["Saída", "Serviço", "Frota", "Placa", "Motorista", "Mat.", "Linha", "Localização", "Previsão"].map(h => (
                  <th key={h} className="text-left px-4 py-4 text-[11px] font-bold text-muted uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filtered.length === 0 ? (
                <tr><td colSpan={10} className="py-20 text-center text-muted italic font-medium">Nenhuma operação registrada para este período</td></tr>
              ) : (
                filtered.map(o => {
                  const isCancelled = (o.frota || "").toUpperCase().includes("CANCELADO") || o.localizacao === "CANCELADO";
                  const isGaragem = o.previsaoITZ === "GARAGEM";
                  const hasTelemetry = o.previsaoITZ !== "--" && !isCancelled;
                  
                  return (
                    <tr key={o.id} className={`hover:bg-[var(--secondary)] transition-colors group ${isCancelled ? "bg-red-500/10" : ""}`}>
                      <td className={`px-4 py-3 font-bold font-mono text-sm ${isCancelled ? "text-red-500" : ""}`}>{o.saida}</td>
                      <td className="px-4 py-3"><span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${isCancelled ? "bg-red-500/20 text-red-500" : "bg-blue-500/10 text-blue-500"}`}>{o.servico}</span></td>
                      <td className={`px-4 py-3 font-black text-sm ${isCancelled ? "text-red-500" : ""}`}>{o.frota}</td>
                      <td className="px-4 py-3 text-muted font-mono">{o.placa}</td>
                      <td className="px-4 py-3 font-medium">{o.motoristaNome}</td>
                      <td className="px-4 py-3 text-muted font-mono">{o.motoristaMat}</td>
                      <td className="px-4 py-3 text-muted truncate max-w-[200px]">{o.linha}</td>
                      <td className="px-4 py-3"><LocationCell initial={o.localizacao} prefixo={o.frota} /></td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1.5">
                          {isGaragem ? (
                            <span className="text-[12px] font-black bg-emerald-500/20 text-emerald-500 px-3 py-1.5 rounded-full w-fit animate-pulse">GARAGEM</span>
                          ) : (
                            <div className="flex items-center gap-2">
                              {hasTelemetry && <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-lg shadow-blue-500/50" />}
                              <span className={`font-mono text-lg font-black tracking-tighter ${isCancelled ? "text-red-400" : "text-blue-400"}`}>{o.previsaoITZ}</span>
                            </div>
                          )}
                          {hasTelemetry && o.distance != null && !isGaragem && (
                            <span className="text-[11px] text-muted font-bold font-mono leading-none">{o.distance.toFixed(1)} km dist.</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs font-bold text-muted pt-2 border-t border-[var(--border)]">
        <div className="flex items-center gap-3 px-4 py-2 bg-[var(--secondary)] rounded-xl border border-[var(--border)] text-blue-500">
          <Calendar className="w-4 h-4" /><span>Escala: {todayDisplay}</span>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-[var(--secondary)] rounded-xl border border-[var(--border)]">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span>Última Sincronia: {lastSync}</span>
        </div>
      </div>
      <OpModal open={modalOpen} initial={editing} turno={activeTurno} onClose={() => setModalOpen(false)} onSave={() => {}} />

      {/* Occurrences Details Modal */}
      {occModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4" onClick={() => setOccModalOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="glass w-full max-w-lg p-8 rounded-3xl z-10 relative" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500"><AlertCircle className="w-5 h-5" /></div>
                <h2 className="text-lg font-bold uppercase tracking-tight">Ocorrências Ativas</h2>
              </div>
              <button onClick={() => setOccModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--secondary)] text-muted"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {occurrences.length === 0 ? (
                <div className="py-12 text-center text-muted italic">Nenhuma ocorrência registrada no momento.</div>
              ) : (
                occurrences.map((occ, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-[var(--secondary)] border border-[var(--border)] flex gap-4 hover:border-blue-500/30 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg font-black font-mono text-blue-500">{occ.vehicleId}</span>
                        <span className="text-[10px] font-mono text-muted bg-[var(--secondary)] px-2 py-0.5 rounded-full border border-[var(--border)]">
                          {occ.lastUpdated ? new Date(occ.lastUpdated).toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' }) : "N/I"}
                        </span>
                      </div>
                      <div className="p-3 bg-red-500/5 rounded-xl border border-red-500/10">
                        <p className="text-sm font-bold text-[var(--foreground)]">{occ.occurrenceText || "Sem descrição"}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function FleetPage() {
  const [tab, setTab] = useState<"posicionamento" | "operacao">("posicionamento");
  const [loading, setLoading] = useState(true);
  const [rawEscala, setRawEscala] = useState<any[]>([]);
  const [occurrences, setOccurrences] = useState<any[]>([]);
  const [fleetTracking, setFleetTracking] = useState<any[]>([]);
  const [staticPos, setStaticPos] = useState<StaticPos[]>([]);
  const [lastSync, setLastSync] = useState("-");

  useEffect(() => {
    async function loadData() {
      try {
        const token = localStorage.getItem("sisget_token");
        if (!token) return;
        const headers = { Authorization: `Bearer ${token}` };
        const [resEscala, resOcc, resFleet, resStatic] = await Promise.all([
          fetch(`${BACKEND_URL}/api/escalas?data=${todayStr}`, { headers }),
          fetch(`${BACKEND_URL}/api/fleet/occurrences`, { headers }),
          fetch(`${BACKEND_URL}/api/fleet/latest`, { headers }),
          fetch(`${BACKEND_URL}/api/fleet/static-pos`, { headers })
        ]);

        if (resEscala.ok) setRawEscala(await resEscala.json());
        if (resOcc.ok) setOccurrences(await resOcc.json());
        if (resFleet.ok) {
          const body = await resFleet.json();
          setFleetTracking(body.fleet || []);
          setLastSync(body.lastSync || "-");
        }
        if (resStatic.ok) setStaticPos(await resStatic.json());
      } catch (err) { console.error(err); } finally { setLoading(false); }
    }
    loadData();
  }, []);

  const mappedOperacoes: Operacao[] = rawEscala.filter(i => {
    const orig = (i.origem || "").toUpperCase();
    return orig.includes("IMPERATRIZ");
  }).map((item, idx) => {
    const hSaidaStr = String(item.horarioSaida || "0");
    const hora = parseInt(hSaidaStr.split(":")[0]) || 0;
    const turno: Turno = (hora >= 18 || hora < 5) ? "NOTURNO" : "DIURNO";
    const tracking = fleetTracking.find(f => (f.vehicleId || "").trim() === (item.carro || "").trim());
    
    let localizacao = tracking?.cityLocation || "N/I";
    let previsaoITZ = item.previsaoITZ || "--";

    if ((item.carro||"").toUpperCase().includes("CANCELADO")) {
      localizacao = "CANCELADO";
      previsaoITZ = "--";
    } else if (tracking) {
      if (tracking.distanceToITZ != null) {
        if (tracking.distanceToITZ < 3.0) {
          localizacao = "GARAGEM";
          previsaoITZ = "GARAGEM";
        } else if (tracking.etaMinutes != null) {
          // Converte minutos de ETA para o horário de parede (Wall Clock)
          const arrival = new Date();
          arrival.setMinutes(arrival.getMinutes() + tracking.etaMinutes);
          previsaoITZ = arrival.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
        }
      }
    }
    
    return {
      id: item.id || idx, saida: (item.horarioSaida || "--:--").substring(0, 5), servico: item.servico || "LINHA",
      frota: item.carro || "N/I", placa: "--", motoristaNome: (item.motorista || "").split("-")[0]?.trim() || "N/I",
      motoristaMat: (item.motorista || "").split("-")[1]?.trim() || "", linha: item.linha || item.trecho || "N/I",
      localizacao: localizacao.toUpperCase(), previsaoITZ, turno,
      lat: tracking?.latitude, lng: tracking?.longitude,
      distance: tracking?.distanceToITZ
    };
  });

  const mappedPos: Posicionamento[] = rawEscala.map((item, idx) => {
    const orig = (item.origem || "").toUpperCase();
    const dest = (item.destino || "").toUpperCase();
    let base: Base = "IMP";
    const isSLZ = (orig.includes("IMPERATRIZ") && dest.includes("LUIS")) || (orig.includes("LUIS") && dest.includes("IMPERATRIZ")) || (orig.includes("GOIANIA") && dest.includes("LUIS")) || (orig.includes("LUIS") && dest.includes("GOIANIA"));
    const isBEL = (orig.includes("IMPERATRIZ") && dest.includes("BELEM")) || (orig.includes("BELEM") && dest.includes("IMPERATRIZ")) || (orig.includes("GOIANIA") && dest.includes("BELEM")) || (orig.includes("BELEM") && dest.includes("GOIANIA"));
    if (isSLZ) base = "SLZ"; else if (isBEL) base = "BEL";
    return { id: item.id || idx, data: item.dataEscala || todayStr, frota: item.carro || "N/I", horario: (item.horarioSaida || "--:--").substring(0, 5), origem: item.origem || "N/I", destino: item.destino || "N/I", base };
  });

  const duplicates = new Set<string>();
  const seen = new Set<string>();
  [...mappedPos.map(p=>p.frota), ...staticPos.map(s=>s.vehicleId)].forEach(id => {
    if (!id || id === "N/I" || id === "CANCELADO") return;
    if (seen.has(id)) duplicates.add(id); else seen.add(id);
  });

  return (
    <div className="space-y-8 w-full max-w-[1800px] mx-auto px-4 lg:px-8">
      <div className="flex items-end justify-between">
        <h1 className="text-3xl font-black tracking-tight" style={{ fontFamily: "var(--font-outfit)" }}>Controle de Frota</h1>
      </div>
      <div className="flex rounded-2xl border border-[var(--border)] overflow-hidden w-fit text-sm font-bold bg-[var(--secondary)]/50">
        {(["posicionamento", "operacao"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`flex items-center gap-2 px-6 py-3 transition-colors ${tab === t ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-muted hover:bg-[var(--secondary)]"}`}>
            {t === "posicionamento" ? <MapPin className="w-4 h-4" /> : <BusFront className="w-4 h-4" />}
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 glass rounded-3xl"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /><p className="text-muted font-bold animate-pulse">Sincronizando com a base de dados...</p></div>
      ) : tab === "posicionamento" ? <PosTab data={mappedPos} staticData={staticPos} duplicates={duplicates} /> : <OpTab data={mappedOperacoes} occurrences={occurrences} lastSync={lastSync} />}
    </div>
  );
}
