"use client";

import { useState, useEffect } from "react";
import { 
  User, 
  Shield, 
  Key, 
  Bell, 
  Monitor, 
  LogOut, 
  Save, 
  UserCircle,
  Mail,
  Smartphone,
  CheckCircle2,
  Lock
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function SettingsPage() {
  const [user, setUser] = useState({ name: "AUXILIAR", matricula: "000000", role: "Auxiliar" });
  const [activeTab, setActiveTab] = useState("perfil");

  // Mock Form States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("sisget_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem!");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Senha atualizada com sucesso!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }, 1500);
  };

  const tabs = [
    { id: "perfil", label: "Meu Perfil", icon: User },
    { id: "seguranca", label: "Segurança", icon: Shield },
    { id: "notificacoes", label: "Notificações", icon: Bell },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <p className="text-xs font-bold text-muted uppercase tracking-widest">Configurações</p>
        <h1 className="text-3xl font-black tracking-tight" style={{ fontFamily: 'var(--font-outfit)' }}>
          Minha Conta
        </h1>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Tabs */}
        <aside className="w-full md:w-64 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                  : 'text-muted hover:bg-[var(--secondary)] hover:text-[var(--foreground)]'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}

          <div className="pt-4 mt-4 border-t border-[var(--border)]">
            <button 
              onClick={() => {
                localStorage.removeItem("sisget_user");
                window.location.href = "/";
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-500/5 transition-all"
            >
              <LogOut className="w-5 h-5" />
              Sair do Sistema
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-8 rounded-3xl"
          >
            {activeTab === "perfil" && (
              <div className="space-y-8">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-3xl bg-blue-600/10 border-2 border-blue-500 flex items-center justify-center text-blue-500 relative group overflow-hidden">
                    <UserCircle className="w-16 h-16" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                      <span className="text-[10px] text-white font-bold uppercase tracking-widest">Alterar</span>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{user.name}</h2>
                    <p className="text-sm text-muted">Matrícula: <span className="font-mono">{user.matricula}</span></p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-bold uppercase tracking-wider">
                        {user.role}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-wider">
                        Ativo
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest ml-1">Nome Completo</label>
                    <div className="relative">
                      <input disabled value={user.name} className="w-full glass bg-[var(--secondary)]/50 border-[var(--border)] rounded-xl px-4 py-3 text-sm opacity-60" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest ml-1">E-mail Corporativo</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                      <input disabled value={`${user.name.toLowerCase().split(' ')[0]}@satelitenorte.com.br`} className="w-full glass bg-[var(--secondary)]/50 border-[var(--border)] rounded-xl px-4 py-3 pl-11 text-sm opacity-60" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest ml-1">Celular / WhatsApp</label>
                    <div className="relative">
                      <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                      <input placeholder="(99) 99999-9999" className="w-full glass bg-[var(--secondary)] border-[var(--border)] rounded-xl px-4 py-3 pl-11 text-sm outline-none focus:border-blue-500 transition-all font-mono" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest ml-1">Unidade / Filial</label>
                    <input disabled value="Imperatriz — MA" className="w-full glass bg-[var(--secondary)]/50 border-[var(--border)] rounded-xl px-4 py-3 text-sm opacity-60" />
                  </div>
                </div>

                <div className="pt-6 border-t border-[var(--border)] flex justify-end">
                  <button className="btn-primary h-12 px-8 flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Salvar Alterações
                  </button>
                </div>
              </div>
            )}

            {activeTab === "seguranca" && (
              <div className="space-y-8">
                <div className="space-y-2">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Lock className="w-5 h-5 text-blue-500" />
                    Alterar Senha de Acesso
                  </h2>
                  <p className="text-sm text-muted">Mantenha sua conta segura alterando sua senha regularmente.</p>
                </div>

                <form onSubmit={handleUpdatePassword} className="space-y-6 max-w-md">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest ml-1">Senha Atual</label>
                    <input 
                      type="password" 
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full glass bg-[var(--secondary)] border-[var(--border)] rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 transition-all" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest ml-1">Nova Senha</label>
                    <input 
                      type="password" 
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full glass bg-[var(--secondary)] border-[var(--border)] rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 transition-all" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest ml-1">Confirmar Nova Senha</label>
                    <input 
                      type="password" 
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full glass bg-[var(--secondary)] border-[var(--border)] rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 transition-all" 
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="btn-primary h-12 w-full flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Key className="w-4 h-4" />
                        Atualizar Senha
                      </>
                    )}
                  </button>
                </form>

                <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 flex gap-4">
                  <Shield className="w-6 h-6 text-blue-500 flex-shrink-0" />
                  <div className="text-xs text-muted leading-relaxed">
                    Sua senha deve ter no mínimo 8 caracteres e incluir letras, números e símbolos especiais para garantir a segurança dos dados operacionais da Satélite Norte.
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notificacoes" && (
              <div className="space-y-8">
                <div className="space-y-2">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Bell className="w-5 h-5 text-blue-500" />
                    Preferências de Notificação
                  </h2>
                  <p className="text-sm text-muted">Escolha quais alertas você deseja receber no sistema.</p>
                </div>

                <div className="space-y-4 pt-4">
                  {[
                    { title: "Novas Ocorrências", desc: "Receber alerta quando um novo aviso de frota for registrado." },
                    { title: "Sincronização de Escala", desc: "Notificar quando a escala do SharePoint for atualizada." },
                    { title: "Troca de Plantão", desc: "Lembretes sobre o encerramento da jornada e repasse de combustíveis." }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-[var(--secondary)] transition-colors border border-transparent hover:border-[var(--border)]">
                      <div>
                        <h4 className="text-sm font-bold">{item.title}</h4>
                        <p className="text-xs text-muted">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-[var(--secondary)] border border-[var(--border)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
