import { useState, useEffect } from "react";
import { Clock, Timer, AlertTriangle } from "lucide-react";

interface NYCClockProps {
  onTimeUpdate?: (nycHour: number, nycHourStr: string) => void;
}

export default function NYCClock({ onTimeUpdate }: NYCClockProps) {
  const [nycTime, setNycTime] = useState<string>("");
  const [sessionStatus, setSessionStatus] = useState<{
    text: string;
    color: string;
    subtext: string;
  }>({ text: "LOAD", color: "text-gray-400", subtext: "Calculating..." });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Formatter for Eastern Time (New York)
      const options: Intl.DateTimeFormatOptions = {
        timeZone: "America/New_York",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      };
      
      const timeFormatter = new Intl.DateTimeFormat("en-US", options);
      const timeStr = timeFormatter.format(now);
      
      // Let's get full standard text with AM/PM for presentation
      const displayStr = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/New_York",
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }).format(now);
      setNycTime(displayStr + " EST");

      // Calculate state for session
      const parts = timeStr.split(":");
      const hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1], 10);
      const totalMinutes = hours * 60 + minutes;

      // Session bounds in minutes from midnight
      const openMin = 9 * 60 + 30; // 9:30 AM
      const prefStartMin = 10 * 60 + 0; // 10:00 AM
      const prefEndMin = 10 * 60 + 30; // 10:30 AM
      const secondaryEndMin = 11 * 60 + 30; // 11:30 AM
      const alertStartMin = 11 * 60 + 25; // 11:25 AM
      const shutdownEndMin = 11 * 60 + 40; // 11:40 AM

      let status = { text: "", color: "", subtext: "" };

      if (totalMinutes < openMin) {
        // Pre-market
        status = {
          text: "PRE-MARKET PREP",
          color: "text-amber-400 border-amber-500/20 bg-amber-500/5",
          subtext: "Prepare your mindset. Core execution starts at 10:00 AM.",
        };
      } else if (totalMinutes >= openMin && totalMinutes < prefStartMin) {
        status = {
          text: "MARKET OPEN (OBSERVING)",
          color: "text-blue-400 border-blue-500/20 bg-blue-500/5",
          subtext: "9:30-10:00 AM noise. Stay patient, wait for your preferred model.",
        };
      } else if (totalMinutes >= prefStartMin && totalMinutes < prefEndMin) {
        status = {
          text: "PREFERRED GOLDEN WINDOW",
          color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10 animate-pulse",
          subtext: "10:00-10:30 AM. Prime probability setups should form here.",
        };
      } else if (totalMinutes >= prefEndMin && totalMinutes < alertStartMin) {
        status = {
          text: "SECONDARY WINDOW ACTIVE",
          color: "text-indigo-400 border-indigo-500/20 bg-indigo-500/5",
          subtext: "10:30-11:30 AM. Strictly accept PnL dynamic. Keep size disciplined.",
        };
      } else if (totalMinutes >= alertStartMin && totalMinutes < secondaryEndMin) {
        status = {
          text: "ALARM STATE: WRAPPING UP",
          color: "text-rose-400 border-rose-500/30 bg-rose-500/10 animate-bounce",
          subtext: "11:25 AM Alarm. Exit active trades or prepare to lock execution. NO new entries.",
        };
      } else if (totalMinutes >= secondaryEndMin && totalMinutes < shutdownEndMin) {
        status = {
          text: "MANDATORY SHUTDOWN PROTOCOL",
          color: "text-red-500 border-red-500/40 bg-red-500/10 font-bold",
          subtext: "CLOSE TRADINGVIEW & BROKER. Step away from your desk IMMEDIATELY.",
        };
      } else {
        status = {
          text: "OUTSIDE MANDATE (PROHIBITED)",
          color: "text-zinc-500 border-zinc-700/20 bg-zinc-800/5",
          subtext: "Market window closed. Step away from screens. Success = zero clicks.",
        };
      }

      setSessionStatus(status);
      
      if (onTimeUpdate) {
        onTimeUpdate(totalMinutes, timeStr);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [onTimeUpdate]);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl shadow-black/40">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-zinc-800/80 rounded-lg border border-zinc-700/50 text-indigo-400 shadow-inner flex items-center justify-center">
          <Clock className="w-6 h-6 animate-spin-slow" />
        </div>
        <div>
          <span className="text-zinc-500 font-mono text-xs tracking-wider uppercase block">New York Market Time</span>
          <span className="text-2xl font-mono text-zinc-100 font-medium tracking-tight whitespace-nowrap min-w-[12rem] block">
            {nycTime || "Calculating..."}
          </span>
        </div>
      </div>

      <div className={`flex-1 border rounded-lg p-3 px-4 ${sessionStatus.color} transition-all duration-300`}>
        <div className="flex items-center gap-2 mb-1">
          <Timer className="w-4 h-4" />
          <span className="text-xs font-mono font-bold tracking-widest">{sessionStatus.text}</span>
        </div>
        <p className="text-xs text-zinc-300 font-sans leading-relaxed">
          {sessionStatus.subtext}
        </p>
      </div>
    </div>
  );
}
