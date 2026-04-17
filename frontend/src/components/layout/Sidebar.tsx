"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BusFront, 
  LayoutDashboard, 
  Warehouse, 
  CalendarClock, 
  Search, 
  BarChart3, 
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Map
} from "lucide-react";
import { useLayout } from "./LayoutContext";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { name: "Garagem", icon: Warehouse, href: "/garage" },
  { name: "Frota", icon: BusFront, href: "/fleet" },
  { name: "Escala", icon: CalendarClock, href: "/scale" },
  { name: "Rastreamento", icon: Map, href: "/tracking" },
];

const secondaryItems = [
  { name: "Relatórios", icon: BarChart3, href: "/reports" },
  { name: "Configurações", icon: Settings, href: "/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isSidebarCollapsed, toggleSidebar } = useLayout();

  return (
    <aside className={`${isSidebarCollapsed ? 'w-20' : 'w-64'} h-screen bg-[var(--sidebar-bg)] border-r border-[var(--border)] flex flex-col fixed left-0 top-0 z-50 transition-all duration-300`}>
      <div className="p-5 flex items-center justify-between">
        {!isSidebarCollapsed && (
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-blue-500/20">
              <BusFront className="w-6 h-6" />
            </div>
            <span className="text-xl font-black tracking-tighter text-[var(--foreground)] italic whitespace-nowrap" style={{ fontFamily: 'var(--font-outfit)' }}>
              SISGET
            </span>
          </div>
        )}
        {isSidebarCollapsed && (
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white mx-auto shadow-lg shadow-blue-500/20">
            <BusFront className="w-6 h-6" />
          </div>
        )}
      </div>

      <button 
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white border-2 border-[var(--sidebar-bg)] hover:bg-blue-600 transition-colors z-50 shadow-md"
      >
        {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      <nav className="flex-1 px-3 space-y-1 mt-4">
        {!isSidebarCollapsed && (
          <p className="px-4 text-[10px] font-bold text-muted uppercase tracking-widest mb-4">Módulos</p>
        )}
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.name} 
              href={item.href}
              title={isSidebarCollapsed ? item.name : ""}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                isActive 
                ? 'bg-blue-600/10 text-blue-500 font-bold' 
                : 'text-zinc-500 hover:text-[var(--foreground)] hover:bg-[var(--secondary)]'
              }`}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-blue-500' : 'group-hover:text-[var(--foreground)]'}`} />
              {!isSidebarCollapsed && <span className="text-sm whitespace-nowrap">{item.name}</span>}
              {!isSidebarCollapsed && isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
              )}
            </Link>
          );
        })}

        <div className="pt-8 pb-4">
          {!isSidebarCollapsed && (
            <p className="px-4 text-[10px] font-bold text-muted uppercase tracking-widest mb-4">Administrativo</p>
          )}
          {secondaryItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                title={isSidebarCollapsed ? item.name : ""}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                  isActive 
                  ? 'bg-blue-600/10 text-blue-500 font-bold' 
                  : 'text-zinc-500 hover:text-[var(--foreground)] hover:bg-[var(--secondary)]'
                }`}
              >
                <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-blue-500' : 'group-hover:text-[var(--foreground)]'}`} />
                {!isSidebarCollapsed && <span className="text-sm whitespace-nowrap">{item.name}</span>}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="p-3 border-t border-[var(--border)]">
        <button 
          onClick={() => {
            localStorage.removeItem("sisget_user");
            window.location.href = "/";
          }}
          title={isSidebarCollapsed ? "Sair do Sistema" : ""}
          className="w-full flex items-center gap-3 px-4 py-3 text-zinc-500 hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isSidebarCollapsed && <span className="text-sm font-medium whitespace-nowrap">Sair do Sistema</span>}
        </button>
      </div>
    </aside>
  );
}
