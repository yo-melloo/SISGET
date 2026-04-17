"use client";

import { useState } from "react";
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
}

// ─── Mock Data ──────────────────────────────────────────────────────────────
const today = new Date().toLocaleDateString("pt-BR");

const initialPosicionamentos: Posicionamento[] = [
  { id: 1, data: today, frota: "1042", horario: "06:00", origem: "IMP", destino: "SLZ", base: "IMP" },
  { id: 2, data: today, frota: "1018", horario: "07:30", origem: "IMP", destino: "BEL", base: "IMP" },
  { id: 3, data: today, frota: "CANCELADO", horario: "08:00", origem: "IMP", destino: "SLZ", base: "IMP" },
  { id: 4, data: today, frota: "2031", horario: "06:30", origem: "SLZ", destino: "IMP", base: "SLZ" },
  { id: 5, data: today, frota: "2045", horario: "09:00", origem: "SLZ", destino: "BEL", base: "SLZ" },
  { id: 6, data: today, frota: "CANCELADO", horario: "10:00", origem: "SLZ", destino: "IMP", base: "SLZ" },
  { id: 7, data: today, frota: "3012", horario: "07:00", origem: "BEL", destino: "IMP", base: "BEL" },
  { id: 8, data: today, frota: "3028", horario: "08:30", origem: "BEL", destino: "SLZ", base: "BEL" },
];

const initialOperacoes: Operacao[] = [
  { id: 1, saida: "05:45", servico: "LINHA", frota: "1042", placa: "NDB-3421", motoristaNome: "RAIMUNDO LIMA", motoristaMat: "081234", linha: "Linha 02 - Imperatriz/São Luís", localizacao: "ENTRONCAMENTO", previsaoITZ: "GARAGEM", turno: "DIURNO" },
  { id: 2, saida: "06:00", servico: "LINHA", frota: "1018", placa: "NDA-1105", motoristaNome: "CARLOS SOUZA", motoristaMat: "073891", linha: "Linha 03 - Imperatriz/Belém", localizacao: "ACRELANDIA", previsaoITZ: "12:30", turno: "DIURNO" },
  { id: 3, saida: "06:30", servico: "FRETAMENTO", frota: "1055", placa: "NDB-9930", motoristaNome: "JOSE FERREIRA", motoristaMat: "092011", linha: "Fretado Petrobras", localizacao: "RODOVIA", previsaoITZ: "08:00", turno: "DIURNO" },
  { id: 4, saida: "18:00", servico: "LINHA", frota: "1042", placa: "NDB-3421", motoristaNome: "MARCOS ALVES", motoristaMat: "066552", linha: "Linha 02 - São Luís/Imperatriz", localizacao: "SLZ", previsaoITZ: "04:30", turno: "NOTURNO" },
  { id: 5, saida: "19:30", servico: "LINHA", frota: "1031", placa: "NDC-0012", motoristaNome: "ANTONIO ROCHA", motoristaMat: "088741", linha: "Linha 04 - Belém/Imperatriz", localizacao: "BEL", previsaoITZ: "05:00", turno: "NOTURNO" },
];

const lateralResumo = {
  carrosReserva: ["1099", "1004"],
  pneus: ["P-445", "P-112"],
  ocorrencias: ["Frota 1018 com aviso de motor — monitorar"],
  outros: ["Reunião de escala: 16h"],
};

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

// ─── Posicionamento Tab ──────────────────────────────────────────────────────
function PosTab() {
  const [posicionamentos, setPosicionamentos] = useState(initialPosicionamentos);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalBase, setModalBase] = useState<Base>("IMP");
  const [editing, setEditing] = useState<Posicionamento | undefined>();

  const byBase = (b: Base) => posicionamentos.filter((p) => p.base === b);

  const handleSave = (data: Omit<Posicionamento, "id">) => {
    if (editing) {
      setPosicionamentos((prev) => prev.map((p) => (p.id === editing.id ? { ...p, ...data } : p)));
    } else {
      setPosicionamentos((prev) => [...prev, { id: Date.now(), ...data }]);
    }
    setEditing(undefined);
  };

  const openNew = (base: Base) => { setModalBase(base); setEditing(undefined); setModalOpen(true); };
  const openEdit = (p: Posicionamento) => { setModalBase(p.base); setEditing(p); setModalOpen(true); };
  const del = (id: number) => setPosicionamentos((prev) => prev.filter((p) => p.id !== id));

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
function OpTab() {
  const [operacoes, setOperacoes] = useState(initialOperacoes);
  const [turno, setTurno] = useState<Turno>("DIURNO");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Operacao | undefined>();

  const filtered = operacoes.filter((o) => o.turno === turno);

  const handleSave = (data: Omit<Operacao, "id">) => {
    if (editing) {
      setOperacoes((prev) => prev.map((o) => (o.id === editing.id ? { ...o, ...data } : o)));
    } else {
      setOperacoes((prev) => [...prev, { id: Date.now(), ...data }]);
    }
    setEditing(undefined);
  };

  const openEdit = (o: Operacao) => { setEditing(o); setModalOpen(true); };
  const del = (id: number) => setOperacoes((prev) => prev.filter((o) => o.id !== id));

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
          <button onClick={() => { setEditing(undefined); setModalOpen(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors">
            <Plus className="w-4 h-4" />
            Nova Operação
          </button>
        </div>

        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  {["Saída", "Serviço", "Frota", "Placa", "Motorista", "Mat.", "Linha", "Localização", "Previsão"].map((h) => (
                    <th key={h} className="text-left px-5 py-4 text-xs font-bold text-muted uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                  <th className="px-5 py-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-muted">
                      <div className="flex flex-col items-center gap-2">
                        <BusFront className="w-8 h-8 opacity-30" />
                        <span>Nenhuma operação registrada</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((o) => (
                    <tr key={o.id} className="hover:bg-[var(--secondary)] transition-colors group">
                      <td className="px-5 py-3.5 font-bold font-mono">{o.saida}</td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-bold px-2 py-1 rounded-lg bg-blue-500/10 text-blue-500">{o.servico}</span>
                      </td>
                      <td className="px-5 py-3.5 font-bold">{o.frota}</td>
                      <td className="px-5 py-3.5 text-muted font-mono">{o.placa}</td>
                      <td className="px-5 py-3.5 font-medium whitespace-nowrap">{o.motoristaNome}</td>
                      <td className="px-5 py-3.5 text-muted font-mono">{o.motoristaMat}</td>
                      <td className="px-5 py-3.5 text-muted max-w-[200px]">
                        <p className="truncate text-xs">{o.linha}</p>
                      </td>
                      <td className="px-5 py-3.5 font-bold text-blue-500 whitespace-nowrap">{o.localizacao}</td>
                      <td className="px-5 py-3.5 font-mono text-xs">{o.previsaoITZ}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEdit(o)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-500/10 text-blue-500">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => del(o.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-red-500">
                            <Trash2 className="w-4 h-4" />
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
              {section.items.map((item, i) => (
                <li key={i} className="text-sm font-medium pl-1 border-l-2 border-[var(--border)]">{item}</li>
              ))}
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

export default function FleetPage() {
  const [tab, setTab] = useState<PageTab>("posicionamento");

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto">
      {/* Page Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-bold text-muted uppercase tracking-widest mb-1">Módulo</p>
          <h1 className="text-3xl font-black tracking-tight" style={{ fontFamily: "var(--font-outfit)" }}>
            Controle de Frota
          </h1>
        </div>
        <div className="flex items-center gap-2 text-muted text-sm">
          <Calendar className="w-4 h-4" />
          <span>{today}</span>
        </div>
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
      {tab === "posicionamento" ? <PosTab /> : <OpTab />}
    </div>
  );
}
