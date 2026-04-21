"use client";

import { useState, useEffect } from "react";
import {
  Wrench,
  Fuel,
  Plus,
  Pencil,
  Trash2,
  Car,
  Circle,
  DropletIcon,
  Clock,
  X,
  ChevronDown,
  LayoutGrid,
  TrendingDown,
  ArrowRightLeft,
  BarChart3,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

// ─── Types ───────────────────────────────────────────────────────────────────
type ReservaType = "CARRO" | "PNEU";
type ReservaStatus = "AGUARDANDO" | "EM_MANUTENCAO" | "LIBERADO";
type GarageView = "TANQUES" | "RESERVAS";

interface Reserva {
  id: number;
  codigo: string; // Sincronizado com backend
  tipo: ReservaType;
  status: ReservaStatus;
  descricao: string;
  atualizadoEm?: string;
  atualizadoPor?: string;
  isExternal?: boolean; // Identifica se veio do Pos. Frota
}

interface Tanque {
  id: number;
  nome: string;
  capacidadeL: number;
  medicaoCm: number;
  volumeL: number;
  atualizadoEm: string;
  atualizadoPor: string;
}

// ─── Helper Maps ──────────────────────────────────────────────────────────────
const statusConfig: Record<
  ReservaStatus,
  { label: string; color: string; bg: string }
> = {
  AGUARDANDO: {
    label: "Aguardando",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  EM_MANUTENCAO: {
    label: "Em Manutenção",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  LIBERADO: {
    label: "Liberado",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
};

// ─── Sub-components ───────────────────────────────────────────────────────────
function TankBar({ tanque, onClick }: { tanque: Tanque; onClick: () => void }) {
  const pct = Math.round((tanque.volumeL / tanque.capacidadeL) * 100);
  const color =
    pct > 50 ? "bg-emerald-500" : pct > 30 ? "bg-amber-500" : "bg-red-500";

  return (
    <div
      onClick={onClick}
      className="glass p-6 rounded-2xl space-y-4 cursor-pointer hover:border-blue-500/50 transition-all group active:scale-[0.98]"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-bold text-sm tracking-tight">{tanque.nome}</h3>
          <p className="text-muted text-[10px] uppercase font-bold tracking-widest mt-0.5">
            Capacidade: {(tanque.capacidadeL ?? 0).toLocaleString("pt-BR")} L
          </p>
        </div>
        <div className="bg-[var(--secondary)] p-2 rounded-xl">
          <DropletIcon className="w-4 h-4 text-blue-500" />
        </div>
      </div>

      <div>
        <div className="flex justify-between items-baseline mb-2">
          <span
            className="text-3xl font-black italic"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            {(tanque.volumeL ?? 0).toLocaleString("pt-BR")}
            <span className="text-xs font-medium text-muted ml-1 not-italic">
              L
            </span>
          </span>
          <span
            className={`text-xl font-bold ${pct > 50 ? "text-emerald-500" : pct > 30 ? "text-amber-500" : "text-red-500"}`}
          >
            {pct}%
          </span>
        </div>
        <div className="w-full bg-[var(--secondary)] rounded-full h-2">
          <div
            className={`${color} h-2 rounded-full transition-all duration-1000`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-muted text-[10px] font-bold uppercase tracking-tighter">
        <Clock className="w-3 h-3" />
        {tanque.medicaoCm ?? 0}cm • {tanque.atualizadoEm} •{" "}
        {(tanque.atualizadoPor ?? "SISTEMA").split(" ")[0]}
      </div>
    </div>
  );
}

// ─── Modals ───────────────────────────────────────────────────────────────────
function FuelUpdateModal({
  open,
  onClose,
  onSave,
  targetTank,
  tanques,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (t1: number, t2: number, isCm: boolean) => void;
  targetTank?: Tanque | null;
  tanques: Tanque[];
}) {
  const [val1, setVal1] = useState("");
  const [val2, setVal2] = useState("");
  const [mode, setMode] = useState<"CM" | "L">("CM");

  useEffect(() => {
    if (open) {
      setVal1("");
      setVal2("");
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(Number(val1) || 0, Number(val2) || 0, mode === "CM");
    onClose();
  };

  const inputClass =
    "w-full rounded-xl px-4 py-3 text-sm outline-none transition-all border focus:border-blue-500 bg-[var(--secondary)] border-[var(--border)] text-[var(--foreground)]";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="glass w-full max-w-md p-8 rounded-3xl z-10 relative">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">Atualizar Medição Diesel</h2>
          <button onClick={onClose} className="text-muted hover:text-white">
            <X />
          </button>
        </div>

        <div className="flex rounded-xl border border-[var(--border)] overflow-hidden mb-6 text-xs font-bold">
          <button
            onClick={() => setMode("CM")}
            className={`flex-1 py-3 transition-colors ${mode === "CM" ? "bg-blue-600 text-white" : "hover:bg-[var(--secondary)]"}`}
          >
            EM CENTÍMETROS (CM)
          </button>
          <button
            onClick={() => setMode("L")}
            className={`flex-1 py-3 transition-colors ${mode === "L" ? "bg-blue-600 text-white" : "hover:bg-[var(--secondary)]"}`}
          >
            EM LITROS (L)
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {tanques.map((t, idx) => {
            const isTarget = !targetTank || t.id === targetTank.id;
            if (!isTarget) return null;

            return (
              <div key={t.id} className="space-y-1.5">
                <label className="text-xs font-bold text-muted uppercase tracking-widest">
                  {t.nome} {mode === "CM" ? "(cm)" : "(L)"}
                </label>
                <input
                  type="number"
                  value={idx === 0 ? val1 : val2}
                  onChange={(e) =>
                    idx === 0 ? setVal1(e.target.value) : setVal2(e.target.value)
                  }
                  placeholder="0"
                  className={inputClass}
                  autoFocus={targetTank?.id === t.id}
                />
              </div>
            );
          })}
          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 font-bold border border-[var(--border)] rounded-xl"
            >
              CANCELAR
            </button>
            <button
              type="submit"
              className="flex-1 py-3 font-bold bg-blue-600 rounded-xl"
            >
              ATUALIZAR
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
function FlowAnalysisModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  const logs = [
    {
      data: "16/04",
      acao: "MEDICÃO",
      v1: "+10.500L",
      v2: "+8.500L",
      total: "19.000L",
    },
    {
      data: "15/04",
      acao: "CONSUMO (DIURNO)",
      v1: "-1.200L",
      v2: "-800L",
      total: "17.000L",
    },
    {
      data: "15/04",
      acao: "DESCARGA (CARRETA)",
      v1: "+5.000L",
      v2: "+0L",
      total: "22.000L",
    },
    {
      data: "14/04",
      acao: "MEDICÃO",
      v1: "7.000L",
      v2: "9.000L",
      total: "16.000L",
    },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="glass w-full max-w-2xl p-8 rounded-[2.5rem] z-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <BarChart3 className="w-40 h-40 text-blue-500" />
        </div>

        <div className="flex items-center justify-between mb-8 relative z-10">
          <div>
            <h2 className="text-2xl font-black tracking-tight">
              Análise de Fluxo
            </h2>
            <p className="text-[10px] font-bold text-muted uppercase tracking-widest mt-1">
              Histórico de Movimentação Diesel
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--secondary)] text-muted hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 mb-8 relative z-10">
          <div className="grid grid-cols-4 gap-4 px-4 text-[10px] font-black text-muted uppercase tracking-widest">
            <span>Data</span>
            <span>Operação</span>
            <span className="text-right">T1 / T2</span>
            <span className="text-right text-white">Total</span>
          </div>
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {logs.map((log, i) => (
              <div
                key={i}
                className="grid grid-cols-4 gap-4 p-4 bg-[var(--secondary)]/50 rounded-2xl border border-[var(--border)] items-center"
              >
                <span className="text-xs font-bold">{log.data}</span>
                <span className="text-[10px] font-black text-blue-500 uppercase">
                  {log.acao}
                </span>
                <span className="text-right text-[10px] font-mono text-muted">
                  {log.v1} / {log.v2}
                </span>
                <span
                  className="text-right text-sm font-black italic"
                  style={{ fontFamily: "var(--font-outfit)" }}
                >
                  {log.total}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-blue-600/10 p-4 rounded-2xl border border-blue-500/20">
          <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest leading-relaxed">
            <TrendingDown className="w-3 h-3 inline mr-2" />
            Ticket Médio de Consumo:{" "}
            <span className="text-white">1.850L / dia</span>
            (Projeção para próxima descarga: 48h)
          </p>
        </div>
      </div>
    </div>
  );
}

function ReservaModal({ open, initial, onClose, onSave }: any) {
  const [cod, setCod] = useState(initial?.codigo ?? "");
  const [tipo, setTipo] = useState(initial?.tipo ?? "CARRO");
  const [status, setStatus] = useState(initial?.status ?? "AGUARDANDO");
  const [descricao, setDescricao] = useState(initial?.descricao ?? "");

  if (!open) return null;

  const handleSubmit = (e: any) => {
    e.preventDefault();
    onSave({ cod, tipo, status, descricao });
    onClose();
  };

  const inputClass =
    "w-full rounded-xl px-4 py-3 text-sm outline-none bg-[var(--secondary)] border border-[var(--border)] text-[var(--foreground)]";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="glass w-full max-w-lg p-8 rounded-3xl z-10 relative">
        <h2 className="text-lg font-bold mb-6">
          {initial?.id ? "Editar" : "Nova"} Reserva
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              value={cod}
              onChange={(e) => setCod(e.target.value)}
              placeholder="CÓDIGO"
              className={inputClass}
              required
            />
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className={inputClass}
            >
              <option value="CARRO">CARRO</option>
              <option value="PNEU">PNEU</option>
            </select>
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={inputClass}
          >
            <option value="AGUARDANDO">AGUARDANDO</option>
            <option value="EM_MANUTENCAO">EM MANUTENÇÃO</option>
            <option value="LIBERADO">LIBERADO</option>
          </select>
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="DESCRIÇÃO"
            className={`${inputClass} h-32 resize-none`}
            required
          />
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 font-bold border border-[var(--border)] rounded-xl"
            >
              CANCELAR
            </button>
            <button
              type="submit"
              className="flex-1 py-3 font-bold bg-blue-600 rounded-xl"
            >
              SALVAR
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function GaragePage() {
  const [view, setView] = useState<GarageView>("TANQUES");
  const [tanques, setTanques] = useState<Tanque[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [fuelModalOpen, setFuelModalOpen] = useState(false);
  const [targetTank, setTargetTank] = useState<Tanque | null>(null);
  const [resModalOpen, setResModalOpen] = useState(false);
  const [flowModalOpen, setFlowModalOpen] = useState(false);
  const [editingRes, setEditingRes] = useState<Reserva | undefined>();

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("sisget_token");
      const headers = { Authorization: `Bearer ${token}` };

      const [tRes, rRes, fRes] = await Promise.all([
        fetch("/api/garage/tanques", { headers }),
        fetch("/api/garage/reservas", { headers }),
        fetch("/api/fleet/static-pos/base/IMP", { headers }),
      ]);

      if (tRes.ok && rRes.ok && fRes.ok) {
        const tData = await tRes.json();
        const rData = await rRes.json();
        const fData = await fRes.json();

        setTanques(tData);

        // Inteligência Bilateral: Mesclar Reservas Locais com Posicionamento de Frota
        const externalReservas = fData
          .filter((f: any) => f.category === "RESERVA")
          .map((f: any) => ({
            id: f.id + 1000000, // Offset para não conflitar IDs
            codigo: f.vehicleId,
            tipo: "CARRO",
            status: "AGUARDANDO",
            descricao: f.notes || "Sincronizado via Pos. Frota",
            isExternal: true,
          }));

        // Remover duplicatas (prioriza externa se já estiver lá?)
        // Na verdade, aqui mesclamos e removemos carros que já estão na reserva local
        const localCodigos = new Set(rData.map((r: any) => r.codigo));
        const finalReservas = [
          ...rData,
          ...externalReservas.filter(
            (ext: any) => !localCodigos.has(ext.codigo),
          ),
        ];

        setReservas(finalReservas);
      }
    } catch (err) {
      console.error("Erro ao carregar dados da garagem:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalVolume = tanques.reduce((acc, t) => acc + (t.volumeL ?? 0), 0);
  const totalCap = tanques.reduce((acc, t) => acc + (t.capacidadeL ?? 0), 0);
  const totalPct = Math.round((totalVolume / totalCap) * 100);

  const handleFuelSave = async (v1: number, v2: number, isCm: boolean) => {
    const factor = 95;
    const token = localStorage.getItem("sisget_token");
    try {
      const updateTank = async (t: Tanque, val: number) => {
        const volume = isCm ? val * factor : val;
        const cm = isCm ? val : Math.round(val / factor);
        await fetch(`/api/garage/tanques/${t.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...t,
            medicaoCm: cm,
            volumeL: volume,
            atualizadoPor: "AUXILIAR",
          }),
        });
      };

      if (!targetTank || targetTank.id === tanques[0]?.id) await updateTank(tanques[0], v1);
      if (!targetTank || targetTank.id === tanques[1]?.id) await updateTank(tanques[1], v2);

      toast.success("Medição atualizada com sucesso!");
      fetchData();
    } catch (err) {
      toast.error("Erro ao atualizar medição");
    }
  };

  const handleResSave = async (data: any) => {
    try {
      const token = localStorage.getItem("sisget_token");
      const { cod, ...rest } = data;
      const res = await fetch("/api/garage/reservas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...editingRes, ...rest, codigo: cod }),
      });

      if (res.ok) {
        toast.success("Reserva salva e sincronizada com a frota!");
        fetchData();
      }
    } catch (err) {
      toast.error("Erro ao salvar reserva");
    }
    setEditingRes(undefined);
  };

  const handleResDelete = async (id: number) => {
    if (id >= 1000000) {
      toast.error(
        "Itens sincronizados devem ser movidos no Posicionamento de Frota",
      );
      return;
    }
    try {
      const token = localStorage.getItem("sisget_token");
      await fetch(`/api/garage/reservas/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Reserva removida");
      fetchData();
    } catch (err) {
      toast.error("Erro ao remover");
    }
  };

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto">
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-xs font-bold text-muted uppercase tracking-widest mb-1">
            Módulo
          </p>
          <h1
            className="text-3xl font-black tracking-tight"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            Controle de Garagem
          </h1>
        </div>

        <div className="flex bg-[var(--secondary)] p-1 rounded-2xl border border-[var(--border)] overflow-hidden font-bold text-xs">
          <button
            onClick={() => setView("TANQUES")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${view === "TANQUES" ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-muted hover:text-white"}`}
          >
            <Fuel className="w-4 h-4" /> TANQUES DIESEL
          </button>
          <button
            onClick={() => setView("RESERVAS")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${view === "RESERVAS" ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-muted hover:text-white"}`}
          >
            <Wrench className="w-4 h-4" /> RESERVAS / OFICINA
          </button>
        </div>
      </section>

      <AnimatePresence mode="wait">
        {view === "TANQUES" ? (
          <motion.div
            key="tanks"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            {...({ className: "space-y-8" } as any)}
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Protagonistas: Tanques Individuais */}
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                {tanques.map((t) => (
                  <div key={t.id} className="relative group">
                    <TankBar
                      tanque={t}
                      onClick={() => {
                        setTargetTank(t);
                        setFuelModalOpen(true);
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Sidebar: Resumo e Ações */}
              <div className="lg:col-span-1 space-y-6">
                <div
                  onClick={() => setFlowModalOpen(true)}
                  className="glass p-8 rounded-3xl border-t-4 border-blue-600 flex flex-col justify-between cursor-pointer hover:border-blue-400 transition-all group"
                >
                  <div>
                    <h2 className="text-sm font-bold text-muted group-hover:text-blue-500 transition-colors uppercase tracking-widest mb-6 flex items-center justify-between">
                      Capacidade Total
                      <BarChart3 className="w-4 h-4" />
                    </h2>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span
                        className="text-4xl font-black italic tracking-tighter"
                        style={{ fontFamily: "var(--font-outfit)" }}
                      >
                        {totalVolume.toLocaleString("pt-BR")}
                      </span>
                      <span className="text-lg font-bold text-muted">
                        / {totalCap.toLocaleString("pt-BR")} L
                      </span>
                    </div>
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-500/10 w-fit px-2 py-1 rounded">
                      SISTEMA INTERLIGADO
                    </p>
                  </div>

                  <div className="mt-8 space-y-4">
                    <div className="flex justify-between text-xs font-black">
                      <span className="text-muted tracking-widest uppercase">
                        NÍVEL GERAL
                      </span>
                      <span
                        className={
                          totalPct > 50
                            ? "text-emerald-500"
                            : totalPct > 30
                              ? "text-amber-500"
                              : "text-red-500"
                        }
                      >
                        {totalPct}%
                      </span>
                    </div>
                    <div className="h-3 bg-[var(--secondary)] rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-1000 ${totalPct > 50 ? "bg-emerald-500" : totalPct > 30 ? "bg-amber-500" : "bg-red-500"}`}
                        style={{ width: `${totalPct}%` }}
                      />
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // BUG FIX: Evitar abertura do FlowAnalysisModal
                        setTargetTank(null);
                        setFuelModalOpen(true);
                      }}
                      className="w-full py-4 mt-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                    >
                      <ArrowRightLeft className="w-4 h-4" /> ATUALIZAR MEDIÇÃO
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="res"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            {...({ className: "space-y-6" } as any)}
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-3">
                <LayoutGrid className="text-blue-500" /> Ativos em Oficina
              </h2>
              <button
                onClick={() => {
                  setEditingRes(undefined);
                  setResModalOpen(true);
                }}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-widest rounded-2xl transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> NOVA RESERVA
              </button>
            </div>

            <div className="glass rounded-3xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="px-6 py-4 text-left text-xs font-bold text-muted uppercase tracking-wider">
                      CÓDIGO
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-muted uppercase tracking-wider">
                      TIPO
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-muted uppercase tracking-wider">
                      STATUS
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-muted uppercase tracking-wider">
                      DESCRIÇÃO
                    </th>
                    <th className="px-6 py-4" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {reservas.map((r) => (
                    <tr
                      key={r.id}
                      className="hover:bg-[var(--secondary)] transition-colors group"
                    >
                      <td
                        className="px-6 py-5 font-black italic tracking-tighter"
                        style={{ fontFamily: "var(--font-outfit)" }}
                      >
                        <div className="flex items-center gap-2">
                          {r.codigo}
                          {r.isExternal && (
                            <span className="text-[8px] px-1.5 py-0.5 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded uppercase font-black">
                              via Pos. Frota
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-[10px] font-black px-2 py-1 bg-[var(--secondary)] rounded border-[var(--border)] uppercase">
                          {r.tipo}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className={`flex items-center gap-2 text-xs font-bold ${(statusConfig[r.status] || statusConfig.AGUARDANDO).color}`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${(statusConfig[r.status] || statusConfig.AGUARDANDO).color.replace("text", "bg")}`}
                          />{" "}
                          {
                            (statusConfig[r.status] || statusConfig.AGUARDANDO)
                              .label
                          }
                        </span>
                      </td>
                      <td className="px-6 py-5 text-muted text-xs font-medium">
                        {r.descricao}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setEditingRes(r);
                              setResModalOpen(true);
                            }}
                            className="p-2 hover:bg-blue-500/10 text-blue-500 rounded-lg"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleResDelete(r.id)}
                            className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <FuelUpdateModal
        open={fuelModalOpen}
        onClose={() => setFuelModalOpen(false)}
        onSave={handleFuelSave}
        targetTank={targetTank}
        tanques={tanques}
      />
      <ReservaModal
        open={resModalOpen}
        initial={editingRes}
        onClose={() => setResModalOpen(false)}
        onSave={handleResSave}
      />
      <FlowAnalysisModal
        open={flowModalOpen}
        onClose={() => setFlowModalOpen(false)}
      />
    </div>
  );
}
