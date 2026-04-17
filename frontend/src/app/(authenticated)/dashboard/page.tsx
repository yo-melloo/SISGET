"use client";

import { motion } from "framer-motion";
import { 
  BusFront, 
  Warehouse, 
  CalendarClock, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2,
  CloudSun,
  Users,
  Wrench,
  X,
  Plus,
  Trash2
} from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

const initialStats = [
  { 
    id: "reserva",
    label: "Carros Reserva", 
    items: ["19001", "19022"],
    icon: BusFront, 
    color: "text-blue-500", 
    bg: "rgba(103, 190, 217, 0.1)" 
  },
  { 
    id: "pneus",
    label: "Pneus Reserva", 
    items: ["P-445 (NOV)", "P-112 (REC)"],
    icon: Wrench, 
    color: "text-amber-500", 
    bg: "rgba(245, 158, 11, 0.1)" 
  },
  { 
    id: "plantao",
    label: "Plantão (ITZ)", 
    items: ["RAIMUNDO L.", "CARLOS S."], // Index 0: Diurno, Index 1: Noturno
    icon: Users, 
    color: "text-emerald-500", 
    bg: "rgba(16, 185, 129, 0.1)" 
  },
];

const modules = [
  { 
    name: "Controle de Garagem", 
    desc: "Gestão de reservas, pneus e medição de tanques de combustível.",
    icon: Warehouse, 
    href: "/garage", 
    color: "from-blue-600 to-indigo-600" 
  },
  { 
    name: "Controle de Frota", 
    desc: "Posicionamento das bases (IMP, SLZ, BEL) e operação diurna/noturna.",
    icon: BusFront, 
    href: "/fleet", 
    color: "from-indigo-600 to-violet-600" 
  },
  { 
    name: "Escala do Fluxo", 
    desc: "Visualização diária da escala integrada via SharePoint.",
    icon: CalendarClock, 
    href: "/scale", 
    color: "from-violet-600 to-purple-600" 
  },
];

function DutyModal({ open, items, onClose, onSave }: { open: boolean, items: string[], onClose: () => void, onSave: (items: string[]) => void }) {
  const [diurno, setDiurno] = useState(items[0] || "");
  const [noturno, setNoturno] = useState(items[1] || "");

  if (!open) return null;

  const handleSave = () => {
    onSave([diurno.toUpperCase(), noturno.toUpperCase()]);
  };

  const inputClass = "w-full bg-[var(--secondary)] border border-[var(--border)] rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:border-emerald-500 transition-all uppercase placeholder:text-muted/30";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="glass w-full max-w-sm p-8 rounded-[2.5rem] z-10 relative">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-black tracking-tight">Escala de Plantão</h2>
            <p className="text-[10px] font-bold text-muted uppercase tracking-widest mt-1">Imperatriz (ITZ)</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--secondary)] text-muted hover:text-white transition-colors">
            <X className="w-5 h-5"/>
          </button>
        </div>

        <div className="space-y-6 mb-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] ml-1">Plantão Diurno</label>
            <input 
              value={diurno}
              onChange={(e) => setDiurno(e.target.value)}
              placeholder="Nome do Motorista"
              className={inputClass}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] ml-1">Plantão Noturno</label>
            <input 
              value={noturno}
              onChange={(e) => setNoturno(e.target.value)}
              placeholder="Nome do Motorista"
              className={inputClass}
            />
          </div>
        </div>

        <button 
          onClick={handleSave}
          className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-[0.3em] rounded-2xl shadow-2xl shadow-emerald-500/20 transition-all active:scale-[0.98]"
        >
          CONFIRMAR ESCALA
        </button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [user, setUser] = useState({ name: "AUXILIAR" });
  const [date, setDate] = useState("");
  const [stats, setStats] = useState(initialStats);
  const [isDutyModalOpen, setIsDutyModalOpen] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("sisget_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setDate(new Date().toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }));
  }, []);

  const handleUpdateDuty = (newItems: string[]) => {
    setStats(prev => prev.map(s => s.id === "plantao" ? { ...s, items: newItems } : s));
    setIsDutyModalOpen(false);
  };

  return (
    <div className="space-y-10 max-w-[1400px] mx-auto">
      <DutyModal 
        open={isDutyModalOpen} 
        items={stats.find(s => s.id === "plantao")?.items || []} 
        onClose={() => setIsDutyModalOpen(false)} 
        onSave={handleUpdateDuty}
      />
      {/* Header Section */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Olá, <span style={{ color: 'var(--primary)' }}>{user.name.split(' ')[0]}</span>!
          </h1>
          <p className="text-muted capitalize">{date}</p>
        </div>
        
        <div className="glass flex items-center gap-4 p-4 rounded-xl">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
            <CloudSun className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-medium">28°C em Imperatriz</div>
            <div className="text-xs text-muted italic">Parcialmente nublado</div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            onClick={() => stat.id === "plantao" && setIsDutyModalOpen(true)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            {...({ className: `glass p-6 rounded-2xl relative overflow-hidden group flex flex-col justify-between transition-all ${stat.id === "plantao" ? 'cursor-pointer hover:border-emerald-500/50' : ''}` } as any)}
          >
            <div className="flex items-start justify-between relative z-10 mb-6">
              <p className="text-[10px] font-bold text-muted uppercase tracking-[0.2em]">{stat.label}</p>
              <div className={`p-2.5 rounded-xl`} style={{ backgroundColor: stat.bg }}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </div>
            
            <div className="space-y-3 relative z-10">
              {stat.items.map((item, idx) => (
                <div key={idx} className="flex flex-col gap-0.5">
                  {stat.id === "plantao" && (
                    <span className={`text-[8px] font-black uppercase tracking-widest ${idx === 0 ? 'text-emerald-500' : 'text-indigo-400'}`}>
                      {idx === 0 ? 'DIURNO' : 'NOTURNO'}
                    </span>
                  )}
                  <div className="flex items-center gap-3">
                    <div className={`w-1 h-4 rounded-full ${stat.color.replace('text', 'bg')}`} />
                    <span className="text-2xl font-black italic tracking-tighter" style={{ fontFamily: 'var(--font-outfit)' }}>
                      {item || "---"}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="absolute right-[-10%] bottom-[-10%] opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
              <stat.icon className="w-32 h-32" />
            </div>
          </motion.div>
        ))}
      </section>

      {/* Modules Grid */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            Módulos Principais
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module, i) => (
            <Link key={module.name} href={module.href}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + (i * 0.1) }}
                {...({ className: "glass group relative h-full p-8 rounded-2xl hover:border-blue-500/50 transition-all duration-300" } as any)}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${module.color} flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-500/10`}>
                  <module.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold mb-2 group-hover:text-blue-500 transition-colors">
                  {module.name}
                </h3>
                <p className="text-sm text-muted leading-relaxed">
                  {module.desc}
                </p>
                <div className="mt-6 flex items-center text-xs font-bold text-blue-500 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                  Acessar Módulo
                  <TrendingUp className="w-3 h-3 ml-2" />
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
}
