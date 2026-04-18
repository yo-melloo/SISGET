"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldCheck, Bus, Key, User, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const [matricula, setMatricula] = useState("");
  const [senha, setSenha] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matricula || !senha) {
      toast.error("Por favor, preencha todos os campos.");
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Mock validation: any matricula/password works for this demo
      const mockUser = {
        name: matricula === "102938" ? "GUSTAVO MELLO" : "AUXILIAR DE TRÁFEGO",
        role: "Auxiliar",
        matricula: matricula
      };
      
      localStorage.setItem("sisget_user", JSON.stringify(mockUser));
      setIsLoading(false);
      toast.success(`Bem-vindo, ${mockUser.name}!`);
      router.push("/dashboard");
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden transition-colors">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-900 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        {...({ className: "glass w-full max-w-md p-8 backdrop-blur-xl shadow-2xl relative z-10" } as any)}
      >
        <div className="flex flex-col items-center mb-8">
          <div style={{ 
            width: '64px', 
            height: '64px', 
            background: 'var(--primary)', 
            borderRadius: '16px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: 'white', 
            marginBottom: '24px',
            boxShadow: '0 8px 16px rgba(103, 190, 217, 0.2)'
          }}>
            <Bus className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-[var(--foreground)] uppercase" style={{ fontFamily: 'var(--font-outfit)' }}>SISGET WEB</h1>
          <p className="text-zinc-500 text-sm font-medium mt-1">SISTEMA DE GERENCIAMENTO DE TRÁFEGO</p>
          <div className="mt-2 text-[10px] font-bold text-zinc-500 bg-[var(--secondary)] px-2 py-0.5 rounded tracking-widest uppercase">
            Satélite Norte • Filial Imperatriz
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Matrícula</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                <User className="w-5 h-5" />
              </div>
              <input 
                type="text" 
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
                placeholder="Ex: 102938"
                style={{
                  width: '100%',
                  background: 'var(--secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: '16px',
                  padding: '16px 16px 16px 48px',
                  color: 'var(--foreground)',
                  outline: 'none',
                  transition: 'border-color 0.3s'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Senha</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                <Key className="w-5 h-5" />
              </div>
              <input 
                type="password" 
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  background: 'var(--secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: '16px',
                  padding: '16px 16px 16px 48px',
                  color: 'var(--foreground)',
                  outline: 'none',
                  transition: 'border-color 0.3s'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-[var(--border)] bg-[var(--background)] text-blue-600" />
              <span className="text-xs text-zinc-500">Lembrar acesso</span>
            </label>
            <button type="button" className="text-xs font-bold text-blue-500 hover:text-blue-400 transition-colors">
              Esqueci a senha
            </button>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="btn-primary w-full"
            style={{ padding: '16px', borderRadius: '16px' }}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                ACESSAR SISTEMA
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </button>
        </form>

        <div className="mt-12 flex flex-col items-center gap-6">
          <div className="flex items-center gap-2 text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
            <div className="h-px w-8 bg-[var(--border)]" />
            Operação Segura
            <div className="h-px w-8 bg-[var(--border)]" />
          </div>
          <div className="flex gap-4">
            <div className="flex flex-col items-center gap-1 opacity-40">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-[8px] uppercase tracking-tighter">OWASP v10</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Footer Info */}
      <div className="absolute bottom-6 left-0 w-full text-center text-zinc-600 text-[10px] font-medium tracking-widest uppercase">
        Desenvolvido por Gustavo Mello &copy; 2026
      </div>
    </div>
  );
}
