"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, X, Check, Filter } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export interface FilterOption {
  label: string;
  value: string;
  category: "BASE" | "ROTA" | "VEICULO" | "OUTROS";
}

interface MultiSelectComboboxProps {
  options: FilterOption[];
  selected: Set<string>;
  onChange: (selected: Set<string>) => void;
  placeholder?: string;
}

export default function MultiSelectCombobox({
  options,
  selected,
  onChange,
  placeholder = "Filtrar por Grupo...",
}: MultiSelectComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Fecha ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (value: string) => {
    const next = new Set(selected);
    if (next.has(value)) {
      next.delete(value);
    } else {
      next.add(value);
    }
    onChange(next);
  };

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(new Set());
  };

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  const categories = Array.from(new Set(options.map((o) => o.category)));

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-[var(--card-bg)] flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
          isOpen ? "border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]" : "border-[var(--border)]"
        }`}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <Filter className={`w-4 h-4 ${selected.size > 0 ? "text-blue-500" : "text-muted"}`} />
          <span className="text-xs font-bold truncate">
            {selected.size === 0
              ? placeholder
              : `${selected.size} ${selected.size === 1 ? "Grupo" : "Grupos"} Selecionados`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <div
              onClick={clearAll}
              className="p-1 hover:bg-red-500/10 rounded-md group transition-colors"
            >
              <X className="w-3 h-3 text-muted group-hover:text-red-500" />
            </div>
          )}
          <ChevronDown
            className={`w-4 h-4 text-muted transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute top-full left-0 right-0 mt-2 bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl shadow-2xl z-[1001] overflow-hidden flex flex-col max-h-[400px]"
          >
            {/* Search Input */}
            <div className="p-3 border-b border-[var(--border)] bg-[var(--secondary)]/30">
              <div className="flex items-center gap-2 px-3 py-2 bg-[var(--card-bg)] rounded-lg border border-[var(--border)]">
                <Search className="w-3 h-3 text-muted" />
                <input
                  autoFocus
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Pesquisar..."
                  className="bg-transparent border-none outline-none text-xs w-full text-white placeholder:text-muted"
                />
              </div>
            </div>

            {/* Options List */}
            <div className="overflow-y-auto custom-scrollbar p-2 space-y-4">
              {categories.map((cat) => {
                const catOptions = filteredOptions.filter((o) => o.category === cat);
                if (catOptions.length === 0) return null;

                return (
                  <div key={cat} className="space-y-1">
                    <p className="px-3 text-[9px] font-black text-blue-500 uppercase tracking-[0.2em] mb-2 sticky top-0 bg-[var(--card-bg)] py-1">
                      {cat === "BASE" ? "Bases / Garagens" : cat === "ROTA" ? "Rotas Operativas" : cat === "VEICULO" ? "Veículos Táticos" : "Outros"}
                    </p>
                    <div className="space-y-0.5">
                      {catOptions.map((opt) => (
                        <div
                          key={opt.value}
                          onClick={() => toggleOption(opt.value)}
                          className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div
                              className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${
                                selected.has(opt.value)
                                  ? "bg-blue-600 border-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.4)]"
                                  : "bg-transparent border-[var(--border)] group-hover:border-blue-500/50"
                              }`}
                            >
                              {selected.has(opt.value) && (
                                <Check className="w-2.5 h-2.5 text-white stroke-[4]" />
                              )}
                            </div>
                            <span
                              className={`text-xs font-bold leading-none truncate ${
                                selected.has(opt.value) ? "text-white" : "text-muted group-hover:text-white"
                              }`}
                            >
                              {opt.label}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {filteredOptions.length === 0 && (
                <div className="p-8 text-center space-y-2">
                  <p className="text-xs font-bold text-muted uppercase tracking-widest">Nada encontrado</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
