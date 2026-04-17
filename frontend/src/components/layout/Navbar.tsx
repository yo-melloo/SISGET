"use client";

import { 
  Bell, 
  Search, 
  UserCircle,
  ChevronDown,
  Moon,
  Sun,
  Monitor
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useLayout } from "./LayoutContext";
import Notifications from "./Notifications";

export default function Navbar() {
  const [userName, setUserName] = useState("AUXILIAR");
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const user = localStorage.getItem("sisget_user");
    if (user) {
      setUserName(JSON.parse(user).name);
    }
  }, []);

  const toggleTheme = () => {
    if (theme === "dark") setTheme("light");
    else if (theme === "light") setTheme("system");
    else setTheme("dark");
  };

  const getThemeIcon = () => {
    if (!mounted) return <Moon className="w-5 h-5" />;
    if (theme === "dark") return <Moon className="w-5 h-5" />;
    if (theme === "light") return <Sun className="w-5 h-5" />;
    return <Monitor className="w-5 h-5" />;
  };

  const { isSidebarCollapsed } = useLayout();

  return (
    <header className={`h-20 bg-[var(--navbar-bg)] backdrop-blur-md border-b border-[var(--border)] fixed top-0 ${isSidebarCollapsed ? 'left-20' : 'left-64'} right-0 z-[60] px-8 flex items-center justify-between transition-all duration-300`}>
      <div className="flex items-center gap-4 bg-[var(--secondary)] border border-[var(--border)] px-4 py-2 rounded-xl w-96 group focus-within:border-blue-500/50 transition-all">
        <Search className="w-4 h-4 text-zinc-500 group-focus-within:text-blue-500" />
        <input 
          type="text" 
          placeholder="Busca rápida (Ctrl+K)..." 
          className="bg-transparent border-none outline-none text-sm text-zinc-300 w-full placeholder:text-zinc-600"
        />
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 relative">
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all relative ${isNotificationsOpen ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'hover:bg-[var(--secondary)] text-zinc-400 hover:text-blue-500'}`}
          >
            <Bell className="w-5 h-5" />
            <div className={`absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 ${isNotificationsOpen ? 'border-blue-600' : 'border-[var(--background)]'}`} />
          </button>

          <Notifications open={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
          <button 
            onClick={toggleTheme}
            className="w-10 h-10 rounded-xl hover:bg-[var(--secondary)] flex items-center justify-center text-zinc-400 hover:text-blue-500 transition-all"
            title={mounted ? `Alternar tema: ${theme === 'dark' ? 'Escuro' : theme === 'light' ? 'Claro' : 'Automático'}` : "Alternar tema"}
          >
            {getThemeIcon()}
          </button>
        </div>

        <div className="h-8 w-px bg-[var(--border)]" />

        <button className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full hover:bg-[var(--secondary)] transition-all">
          <div className="text-right hidden md:block">
            <p className="text-xs font-bold text-[var(--foreground)] uppercase tracking-tighter">{userName}</p>
            <p className="text-[10px] text-zinc-500 font-medium">Filial Imperatriz</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
            <UserCircle className="w-6 h-6" />
          </div>
          <ChevronDown className="w-4 h-4 text-zinc-600" />
        </button>
      </div>
    </header>
  );
}
