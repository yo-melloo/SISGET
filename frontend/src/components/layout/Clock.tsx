"use client";

import { useEffect, useState } from "react";
import { Clock as ClockIcon } from "lucide-react";

export default function Clock() {
  const [time, setTime] = useState<string | null>(null);
  const [period, setPeriod] = useState<'dawn' | 'morning' | 'afternoon' | 'night'>('morning');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const updateTime = () => {
      const now = new Date();
      const hour = now.getHours();

      // Determinar período
      if (hour >= 0 && hour < 6) setPeriod('dawn');
      else if (hour >= 6 && hour < 12) setPeriod('morning');
      else if (hour >= 12 && hour < 18) setPeriod('afternoon');
      else setPeriod('night');

      setTime(now.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
      }));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted || !time) return null;

  const styles = {
    dawn: "bg-indigo-950 text-indigo-100 border-indigo-900 shadow-indigo-500/10",
    morning: "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800 shadow-amber-500/10",
    afternoon: "bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 border-orange-300 dark:border-orange-800 shadow-orange-500/10",
    night: "bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-800 shadow-blue-500/10"
  };

  return (
    <div className={`hidden lg:flex items-center gap-3 px-4 py-2 border rounded-xl font-black tabular-nums shadow-sm select-none transition-all duration-700 ${styles[period]}`}>
      <ClockIcon className={`w-4 h-4 animate-pulse`} />
      <span className="text-sm tracking-widest">{time}</span>
    </div>
  );
}
