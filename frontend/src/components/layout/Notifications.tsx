"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, 
  X, 
  Fuel, 
  Calendar, 
  Wrench, 
  AlertCircle,
  CheckCircle2,
  Trash2
} from "lucide-react";
import { useState } from "react";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: "ALERT" | "INFO" | "SUCCESS" | "GARAGE";
  time: string;
  read: boolean;
}

const initialNotifications: Notification[] = [
  {
    id: 1,
    title: "Alerta de Tanque",
    message: "Nível do Tanque 01 abaixo de 30%. Sugerida nova descarga.",
    type: "GARAGE",
    time: "10 min atrás",
    read: false
  },
  {
    id: 2,
    title: "Escala Publicada",
    message: "A escala para o dia 17/04 já está disponível no módulo do fluxo.",
    type: "INFO",
    time: "1 hora atrás",
    read: false
  },
  {
    id: 3,
    title: "Manutenção Concluída",
    message: "O veículo 1042 foi liberado da oficina pela equipe técnica.",
    type: "SUCCESS",
    time: "2 horas atrás",
    read: true
  }
];

export default function Notifications({ open, onClose }: { open: boolean, onClose: () => void }) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case "GARAGE": return <Fuel className="w-4 h-4 text-amber-500" />;
      case "INFO": return <Calendar className="w-4 h-4 text-blue-500" />;
      case "SUCCESS": return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      default: return <AlertCircle className="w-4 h-4 text-zinc-500" />;
    }
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="absolute top-16 right-0 w-96 bg-[var(--background)] rounded-[2rem] border border-[var(--border)] shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[70] overflow-hidden"
          >
            <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-black uppercase tracking-widest text-[var(--foreground)]">Central de Alertas</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-blue-600 text-white text-[10px] font-black rounded-full leading-none">
                    {unreadCount}
                  </span>
                )}
              </div>
              <button 
                onClick={markAllRead}
                className="text-[10px] font-bold text-blue-500 hover:text-blue-400 uppercase tracking-widest transition-colors"
              >
                Marcar todas como lidas
              </button>
            </div>

            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              {notifications.length > 0 ? (
                <div className="divide-y divide-[var(--border)]">
                  {notifications.map((n) => (
                    <div 
                      key={n.id} 
                      className={`p-5 hover:bg-[var(--secondary)]/50 transition-colors relative group ${!n.read ? 'bg-blue-500/[0.02]' : ''}`}
                    >
                      <div className="flex gap-4">
                        <div className="mt-1 w-8 h-8 rounded-xl bg-[var(--secondary)] flex items-center justify-center shrink-0">
                          {getIcon(n.type)}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-start justify-between">
                            <h4 className={`text-xs font-black uppercase tracking-tight ${!n.read ? 'text-[var(--foreground)]' : 'text-zinc-500'}`}>
                              {n.title}
                            </h4>
                            <span className="text-[9px] text-zinc-600 font-bold uppercase">{n.time}</span>
                          </div>
                          <p className="text-[11px] text-zinc-400 leading-relaxed font-medium pr-4">
                            {n.message}
                          </p>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => removeNotification(n.id)}
                        className="absolute top-4 right-4 text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>

                      {!n.read && (
                        <div className="absolute top-5 right-2 w-1.5 h-1.5 bg-blue-500 rounded-full" />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <Bell className="w-12 h-12 text-zinc-700 mx-auto mb-4 opacity-20" />
                  <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest">Sem novas notificações</p>
                </div>
              )}
            </div>

            <button className="w-full py-4 bg-[var(--secondary)]/50 text-[10px] font-black text-muted hover:text-[var(--foreground)] transition-colors uppercase tracking-[0.2em] border-t border-[var(--border)]">
              Ver histórico completo
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
