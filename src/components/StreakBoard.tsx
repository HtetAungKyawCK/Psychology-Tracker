import { useState } from "react";
import { DaySession, StreakStats, Trade } from "../types";
import { 
  Award, 
  Flame, 
  Calendar, 
  ShieldCheck, 
  Trophy, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  FileText,
  User,
  History,
  Info
} from "lucide-react";

interface StreakBoardProps {
  history: DaySession[];
  stats: StreakStats;
}

export default function StreakBoard({ history, stats }: StreakBoardProps) {
  const [selectedDay, setSelectedDay] = useState<DaySession | null>(
    history.length > 0 ? history[history.length - 1] : null
  );

  // Let us calculate habit markers progress
  const habitProgress = Math.min(100, (stats.currentStreak / 5) * 100);
  const identityProgress = Math.min(100, (stats.currentStreak / 14) * 100);
  const professionalProgress = Math.min(100, (stats.currentStreak / 30) * 100);

  const getComplianceStatusBadge = (status: DaySession["complianceStatus"]) => {
    switch (status) {
      case "EXCELLENT":
        return <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 text-[9px] uppercase px-2 py-0.5 rounded font-bold font-mono">EXCELLENT</span>;
      case "COMPLIANT":
        return <span className="bg-indigo-950/80 text-indigo-400 border border-indigo-500/30 text-[9px] uppercase px-2 py-0.5 rounded font-bold font-mono">COMPLIANT</span>;
      default:
        return <span className="bg-red-950/80 text-red-400 border border-red-500/30 text-[9px] uppercase px-2 py-0.5 rounded font-bold font-mono">VIOLATION</span>;
    }
  };

  const getPnlColor = (amount: number) => {
    if (amount > 0) return "text-emerald-400";
    if (amount < 0) return "text-red-400";
    return "text-zinc-400";
  };

  // Helper to compute a day's total net PnL sum
  const getDayTotalPnL = (day: DaySession) => {
    return day.trades.reduce((sum, t) => sum + t.pnlAmount, 0);
  };

  // Prepare chart data parameters
  const maxDayChartPoints = 15; // Display last 15 days in the visual bar chart
  const recsForChart = history.slice(-maxDayChartPoints);
  
  // Find highest profit and deepest loss to scale our custom SVG chart correctly
  const pnlValues = recsForChart.map(getDayTotalPnL);
  const maxProfitVal = Math.max(...pnlValues, 300); // minimum scale limit
  const maxLossVal = Math.abs(Math.min(...pnlValues, -500)); // minimum scale limit for loss
  const limitScale = Math.max(maxProfitVal, maxLossVal, 600); // standard scale anchor

  return (
    <div className="space-y-6">
      {/* STATS MATRIX SECTION */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Streak card */}
        <div id="streak-card-current" className="bg-zinc-900 border border-zinc-800/80 rounded-xl p-4 shadow-md flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-full blur-lg" />
          <div className="p-3 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-lg">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider block font-semibold">Compliance Streak</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-mono font-bold text-zinc-100">{stats.currentStreak}</span>
              <span className="text-zinc-500 text-xs">Days</span>
            </div>
          </div>
        </div>

        {/* Highest Streak */}
        <div id="streak-card-peak" className="bg-zinc-900 border border-zinc-800/80 rounded-xl p-4 shadow-md flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 rounded-lg">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider block font-semibold">All-Time Peak Streak</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-mono font-bold text-zinc-100">{stats.highestStreak}</span>
              <span className="text-zinc-500 text-xs">Days</span>
            </div>
          </div>
        </div>

        {/* Compliance Rate */}
        <div id="streak-card-adherence" className="bg-zinc-900 border border-zinc-800/80 rounded-xl p-4 shadow-md flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider block font-semibold">Contract Adherence</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-mono font-bold text-zinc-100">
                {stats.totalDays > 0 ? Math.round((stats.compliantDays / stats.totalDays) * 100) : 100}%
              </span>
              <span className="text-zinc-500 text-xs">({stats.compliantDays}/{stats.totalDays})</span>
            </div>
          </div>
        </div>

        {/* Total Sessions logged */}
        <div id="streak-card-sessions" className="bg-zinc-900 border border-zinc-800/80 rounded-xl p-4 shadow-md flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-lg">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider block font-semibold">Total Sessions Logged</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-mono font-bold text-zinc-100">{history.length}</span>
              <span className="text-zinc-500 text-xs">Days Done</span>
            </div>
          </div>
        </div>
      </div>

      {/* DETAILED DAY-BY-DAY VISUAL GRAPH & HISTORICAL HEAT TIMELINE */}
      <div id="visual-reports-section" className="grid grid-cols-1 xl:grid-cols-12 gap-6">

        {/* LEFT COLUMN: VISUAL GRAPHS (8 COLS ON DESKTOP) */}
        <div className="xl:col-span-8 space-y-6">
          {/* DAILY BAR FLUX CHART (တရက်ချင်းစီအလိုက် အမြတ်/အရှုံး ပုံဖော်ချက်) */}
          <div className="bg-zinc-900 border border-zinc-850 rounded-xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <div>
                  <h3 className="text-xs font-bold text-zinc-200 tracking-wider font-mono uppercase">
                    DAILY CASH PERFORMANCE GRAPH (တရက်ချင်းစီအလိုက် ငွေကြေးအမြတ်/အရှုံးပြဇယား)
                  </h3>
                  <p className="text-[10px] text-zinc-500">နောက်ဆုံးမှတ်တမ်းဝင်ထားသော လုပ်ဆောင်မှု {maxDayChartPoints} ရက်စာ PnL</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-500">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded bg-emerald-500" /> Profit
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded bg-rose-500" /> Loss
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-4 border-t border-dashed border-red-500" /> Max -500 Zone
                </span>
              </div>
            </div>

            {history.length === 0 ? (
              <div className="h-44 flex items-center justify-center border border-dashed border-zinc-800 rounded-lg text-zinc-650 text-xs font-mono uppercase bg-zinc-950/30">
                တရက်ချင်းစီအလိုက် Visual Chart ပေါ်လာရန် Trade Log များကို အရင်ဆုံးပိတ်သိမ်းပေးပါ။
              </div>
            ) : (
              <div className="space-y-4">
                {/* SVG SCALE CONTAINER */}
                <div className="relative pt-2">
                  {/* Danger zone line banner */}
                  <div className="absolute left-0 right-0 border-t border-dashed border-red-500/40 z-10 pointer-events-none" 
                       style={{ top: `${50 + (500 / limitScale) * 50}%` }}
                       title="-$500 Max Daily Loss Threshold">
                    <span className="absolute right-2 -top-4 text-[8px] font-mono text-red-500/80 font-bold tracking-wider">
                      -$500 DAILY MAX LOSS LIMIT
                    </span>
                  </div>

                  {/* Profit Zone line at 0 */}
                  <div className="absolute left-0 right-0 border-t border-zinc-800 z-1 pointer-events-none" style={{ top: '50%' }} />

                  {/* The Daily Bar list */}
                  <div className="h-48 flex items-end justify-between gap-1 sm:gap-2 px-1">
                    {recsForChart.map((day, dIdx) => {
                      const dayPnL = getDayTotalPnL(day);
                      // Calculate height percentage based on limitScale
                      const multiplier = 50 / limitScale;
                      const barHeightPercent = Math.min(50, Math.abs(dayPnL) * multiplier);
                      const isProfit = dayPnL >= 0;
                      const isSelected = selectedDay?.date === day.date;

                      return (
                        <div 
                          key={day.date + dIdx}
                          onClick={() => setSelectedDay(day)}
                          className="flex-1 flex flex-col items-center group cursor-pointer"
                        >
                          {/* Top offset wrapper to project bars relative to center axis */}
                          <div className="w-full h-full flex flex-col justify-end relative">
                            {/* Hover info label */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-zinc-950 border border-zinc-850 px-2 py-1 rounded text-[9px] font-mono text-zinc-200 z-30 whitespace-nowrap shadow-xl">
                              <div className="font-semibold text-zinc-400">{day.date}</div>
                              <div className={isProfit ? "text-emerald-400" : "text-red-400"}>
                                PnL: {isProfit ? "+" : ""}${dayPnL.toFixed(2)}
                              </div>
                              <div className="text-zinc-500">{day.trades.length} trades · {day.complianceStatus}</div>
                            </div>

                            {/* Bar segment itself */}
                            <div className="w-full flex flex-col justify-center h-full">
                              {/* Upper Column (Profits) */}
                              <div className="h-1/2 flex items-end">
                                {isProfit && (
                                  <div 
                                    style={{ height: `${barHeightPercent * 2}%` }}
                                    className={`w-full rounded-t transition-all duration-300 ${
                                      isSelected 
                                        ? "bg-emerald-400 shadow-md shadow-emerald-500/30 border border-emerald-300"
                                        : "bg-emerald-500/60 hover:bg-emerald-500"
                                    }`}
                                  />
                                )}
                              </div>
                              {/* Lower Column (Losses) */}
                              <div className="h-1/2 flex items-start">
                                {!isProfit && (
                                  <div 
                                    style={{ height: `${barHeightPercent * 2}%` }}
                                    className={`w-full rounded-b transition-all duration-300 ${
                                      isSelected
                                        ? "bg-red-400 shadow-md shadow-red-500/30 border border-red-300"
                                        : "bg-red-500/60 hover:bg-red-500"
                                    } ${dayPnL <= -500 ? "animate-pulse" : ""}`}
                                  />
                                )}
                              </div>
                            </div>

                          </div>
                          {/* Short Date stamp beneath bars */}
                          <span className={`text-[8px] font-mono mt-1 ${isSelected ? "text-amber-400 font-bold" : "text-zinc-650"}`}>
                            {day.date.substring(0, 5)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-zinc-950/60 border border-zinc-800 rounded p-3 flex items-center justify-between text-[11px] text-zinc-400 font-sans">
                  <div className="flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Visual Bar များအပေါ် ကလိစ်နှိပ်၍ သက်ဆိုင်ရာ နေ့အလိုက် အသေးစိတ်အချက်အလက်ကို ညာဘက်တွင် ကြည့်ရှုနိုင်သည်။</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SESSIONS HEATMAP AND LOGS LIST (တရက်ချင်း လမ်းညွှန်ပြသဇယား) */}
          <div className="bg-zinc-900 border border-zinc-850 rounded-xl p-5 shadow-lg space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-zinc-400" />
              <h3 className="text-xs font-bold text-zinc-200 tracking-wider font-mono uppercase">
                TRADING CALENDAR GRID & METRICS (နေ့စဉ် ခြေလှမ်းမှတ်တမ်းဇယား)
              </h3>
            </div>

            {history.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-zinc-800 rounded-lg text-zinc-600 text-xs font-mono uppercase bg-zinc-950/20">
                No sessions saved yet. Add and close sessions in the Active Trading Desk to see calendar metrics.
              </div>
            ) : (
              <div className="space-y-4">
                {/* Micro Squares (Contribution grid style for trading psychology) */}
                <div className="bg-zinc-950 p-4 border border-zinc-850 rounded-xl">
                  <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest block mb-2 font-semibold">
                    Visual Adherence Matrix
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {history.map((day, idx) => {
                      const dayPnL = getDayTotalPnL(day);
                      const isExcellent = day.complianceStatus === "EXCELLENT";
                      const isViolation = day.complianceStatus === "FAILED";
                      const isSelected = selectedDay?.date === day.date;
                      
                      let boxBg = "bg-zinc-800 hover:bg-zinc-700";
                      let boxBorder = "border border-zinc-700/50";
                      
                      if (isViolation) {
                        boxBg = "bg-red-900/60 hover:bg-red-800 text-red-100";
                        boxBorder = "border border-red-500/50";
                      } else if (isExcellent) {
                        boxBg = "bg-emerald-900/60 hover:bg-emerald-800 text-emerald-100";
                        boxBorder = "border border-emerald-500/50";
                      } else {
                        boxBg = "bg-indigo-900/60 hover:bg-indigo-800 text-indigo-100";
                        boxBorder = "border border-indigo-500/50";
                      }

                      if (isSelected) {
                        boxBorder = "border-2 border-amber-400 shadow-sm shadow-amber-400/20";
                      }

                      return (
                        <button
                          key={day.date + "-" + idx}
                          onClick={() => setSelectedDay(day)}
                          className={`w-9 h-9 rounded flex flex-col items-center justify-center text-[10px] font-mono leading-none transition-all cursor-pointer ${boxBg} ${boxBorder}`}
                          title={`${day.date}: ${dayPnL >= 0 ? "+" : ""}$${dayPnL.toFixed(0)} | ${day.complianceStatus}`}
                        >
                          <span className="text-[8px] font-semibold opacity-60">D</span>
                          <span className="font-bold">{idx + 1}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Legacy Data Table */}
                <div className="overflow-x-auto border border-zinc-850 rounded-xl">
                  <table className="w-full text-left text-xs border-collapse font-sans bg-zinc-950/20">
                    <thead>
                      <tr className="border-b border-zinc-850 bg-zinc-900/40 text-zinc-500 font-mono tracking-wider">
                        <th className="p-3.5 font-semibold text-[10px]">DATE</th>
                        <th className="p-3.5 font-semibold text-[10px]">TRADES</th>
                        <th className="p-3.5 font-semibold text-[10px]">CLOSED PNL</th>
                        <th className="p-3.5 font-semibold text-[10px]">COMPLIANCE SCORE</th>
                        <th className="p-3.5 font-semibold text-[10px]">STATUS</th>
                        <th className="p-3.5 font-semibold text-[10px] text-right">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-850/40">
                      {history.map((day, idx) => {
                        const dayPnL = getDayTotalPnL(day);
                        const isSelected = selectedDay?.date === day.date;
                        return (
                          <tr 
                            key={day.date + "-tbl-" + idx} 
                            onClick={() => setSelectedDay(day)}
                            className={`font-mono text-zinc-300 hover:bg-zinc-800/10 cursor-pointer transition-colors ${
                              isSelected ? "bg-zinc-900/50" : ""
                            }`}
                          >
                            <td className="p-3.5 text-zinc-400 font-semibold">{day.date}</td>
                            <td className="p-3.5 text-zinc-300 font-semibold">{day.trades.length} active</td>
                            <td className={`p-3.5 font-bold ${getPnlColor(dayPnL)}`}>
                              {dayPnL >= 0 ? "+" : ""}${dayPnL.toFixed(2)}
                            </td>
                            <td className="p-3.5">
                              <span className="text-zinc-200">{day.complianceScore}%</span>
                            </td>
                            <td className="p-3.5">{getComplianceStatusBadge(day.complianceStatus)}</td>
                            <td className="p-3.5 text-right font-sans">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedDay(day);
                                }}
                                className="text-[10px] bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-850 hover:bg-zinc-800 px-2.5 py-1 rounded"
                              >
                                View Detailed logs
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: DETAIL DAY INSPECTOR CARD (4 COLS ON DESKTOP) */}
        <div className="xl:col-span-4">
          <div className="bg-zinc-900 border border-zinc-850 rounded-xl p-5 shadow-lg space-y-4 sticky top-20">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-500" />
                <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-zinc-100">
                  DAY DIAGNOSTIC INSIGHTS
                </h4>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono font-bold tracking-tight uppercase">
                တရက်ချင်းစုံစမ်းရန်
              </span>
            </div>

            {selectedDay ? (
              <div className="space-y-4 animate-in fade-in duration-300">
                {/* Summary block */}
                <div className="bg-zinc-950 p-4 border border-zinc-850 rounded-lg space-y-3 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-zinc-800/10 rounded-full blur-md" />
                  
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-zinc-400 font-mono text-xs font-bold">{selectedDay.date} SUMMARY</span>
                    {getComplianceStatusBadge(selectedDay.complianceStatus)}
                  </div>

                  {/* Cash Value Net Box */}
                  <div className="pt-2 flex items-baseline gap-1">
                    <span className={`text-2xl font-mono font-extrabold ${getPnlColor(getDayTotalPnL(selectedDay))}`}>
                      {getDayTotalPnL(selectedDay) >= 0 ? "+" : ""}${getDayTotalPnL(selectedDay).toFixed(2)}
                    </span>
                    <span className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider font-semibold">Net PnL</span>
                  </div>

                  {/* Inner small grid metrics */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-900 text-[10px] font-mono text-zinc-400">
                    <div>
                      <span className="text-zinc-600 block text-[9px] uppercase font-semibold">TOTAL TRADES</span>
                      <span className="text-zinc-200 text-sm font-bold">{selectedDay.trades.length} Actions</span>
                    </div>
                    <div>
                      <span className="text-zinc-600 block text-[9px] uppercase font-semibold">COMPLIANCE SCORE</span>
                      <span className="text-zinc-200 text-sm font-bold">{selectedDay.complianceScore}%</span>
                    </div>
                  </div>
                </div>

                {/* Shutdown completed visual checklist state */}
                <div className="space-y-2">
                  <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest block font-bold">
                    SHUTDOWN PROTOCOL TRACE (ပိတ်သိမ်းမှု ဆန္ဒပိုင်းဆိုင်ရာ စစ်ဆေးမှု)
                  </span>
                  <div className="bg-zinc-950 p-3 border border-zinc-850/80 rounded-lg space-y-2 text-[11px] font-sans text-zinc-300">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${selectedDay.shutdownCompleted.alarm1125 ? "bg-emerald-500" : "bg-red-500"}`} />
                        Alarm 11:25 AM Set & Checked
                      </span>
                      <span className="font-mono text-[9px] text-zinc-500">{selectedDay.shutdownCompleted.alarm1125 ? "Passed" : "Failed"}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${selectedDay.shutdownCompleted.closed1130 ? "bg-emerald-500" : "bg-red-500"}`} />
                        Tables/TV Closed by 11:30 AM
                      </span>
                      <span className="font-mono text-[9px] text-zinc-500">{selectedDay.shutdownCompleted.closed1130 ? "Passed" : "Failed"}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${selectedDay.shutdownCompleted.desk1135 ? "bg-emerald-500" : "bg-red-500"}`} />
                        Desk Risen to standing pose
                      </span>
                      <span className="font-mono text-[9px] text-zinc-500">{selectedDay.shutdownCompleted.desk1135 ? "Passed" : "Failed"}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${selectedDay.shutdownCompleted.screen1140 ? "bg-emerald-500" : "bg-red-500"}`} />
                        Screen Darkened successfully
                      </span>
                      <span className="font-mono text-[9px] text-zinc-500">{selectedDay.shutdownCompleted.screen1140 ? "Passed" : "Failed"}</span>
                    </div>
                  </div>
                </div>

                {/* Day's Individual Trade logs lists */}
                <div className="space-y-2">
                  <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest block font-bold">
                    TRADE EXECUTION MATRIX (ယနေ့ အရောင်းအဝယ်မှတ်တမ်းများ)
                  </span>
                  {selectedDay.trades.length === 0 ? (
                    <div className="text-zinc-650 text-xs italic font-sans py-3 text-center bg-zinc-950 border border-zinc-850 rounded">
                      No trades were logged on this business day.
                    </div>
                  ) : (
                    <div className="space-y-2 select-none">
                      {selectedDay.trades.map((tr, trIdx) => (
                        <div key={tr.id} className="bg-zinc-950 p-2.5 border border-zinc-850/55 rounded-lg flex items-center justify-between gap-3 text-xs font-mono">
                          <div>
                            <span className="text-zinc-[450] text-[9px] block mb-0.5">{tr.time}</span>
                            <span className="text-zinc-200 font-sans font-bold">{tr.setupName}</span>
                          </div>

                          <div className="text-right">
                            <span className={`font-bold block ${tr.pnlAmount >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                              {tr.pnlAmount >= 0 ? "+" : ""}${tr.pnlAmount.toFixed(2)}
                            </span>
                            <span className="text-[8px] text-zinc-500 bg-zinc-900 border border-zinc-850 px-1 py-0.5 rounded font-bold uppercase">
                              {tr.pnl}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Reflection Notes logged */}
                <div className="space-y-1.5">
                  <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest block font-bold">
                    MY DIAGNOSTIC REFLECTIONS (ဆန်းစစ်ချက် အကြံပြုချက်များ)
                  </span>
                  <div className="bg-zinc-950 p-3.5 border border-zinc-850 rounded-lg text-xs leading-relaxed text-zinc-300 font-sans whitespace-pre-line text-justify max-h-40 overflow-y-auto">
                    {selectedDay.reflections || (
                      <span className="text-zinc-[650] italic block">ဆန်းစစ်ချက် သုံးသပ်ချက်များ ရေးသားထားခြင်း မရှိပါ။</span>
                    )}
                  </div>
                </div>

              </div>
            ) : (
              <div className="text-center py-24 text-zinc-500 text-xs font-sans">
                အသေးစိတ်မှတ်တမ်းများ စုံစမ်းရန် ဘယ်ဘက်ဇယားမှ ရက်စွဲတစ်ခုကို ရွေးပါ သို့မဟုတ် ကလိစ်နှိပ်ပါ။
              </div>
            )}
          </div>
        </div>

      </div>

      {/* IDENTITY TIMELINE / HABIT PROGRESS BLOCK */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 shadow-lg space-y-5">
        <div>
          <h3 className="text-sm font-bold text-zinc-200 tracking-wide inline-flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500 animate-spin-slow" />
            IDENTITY TRANSFORMATION TIMELINE (ကိုယ်ရည်ကိုယ်သွေး ပြောင်းလဲလာမှု လမ်းပြမြေပုံ)
          </h3>
          <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed font-sans">
            5/14/30 ရက်မြောက် စည်းကမ်းလိုက်နာမှု တိုက်ပွဲများကို အနိုင်ယူခြင်းဖြင့် ကျွမ်းကျင်သော Trader တစ်ဦးအဖြစ် Identity ကို ပြောင်းလဲယူပါ။
          </p>
        </div>

        <div className="space-y-4">
          {/* Phase 1: 5 Days Habit */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5 font-sans">
              <span className="text-zinc-300 font-semibold flex items-center gap-1.5">
                <span className="inline-flex w-2 h-2 rounded-full bg-amber-500" />
                Phase 1: 5-Day Streak - Habit Formation (အပြုအမူသစ် စတင်ဖြစ်ပေါ်ရန်)
              </span>
              <span className="text-zinc-500 font-mono">{stats.currentStreak}/5 Days ({Math.round(habitProgress)}%)</span>
            </div>
            <div className="w-full bg-zinc-900 h-2 rounded-full border border-zinc-800 overflow-hidden">
              <div 
                className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${habitProgress}%` }}
              />
            </div>
          </div>

          {/* Phase 2: 14 Days Identity */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5 font-sans">
              <span className="text-zinc-300 font-semibold flex items-center gap-1.5">
                <span className="inline-flex w-2 h-2 rounded-full bg-indigo-500" />
                Phase 2: 14-Day Streak - Identity Transformation (ကိုယ်ရည်ကိုယ်သွေး ပြောင်းလဲရန်)
              </span>
              <span className="text-zinc-500 font-mono">{stats.currentStreak}/14 Days ({Math.round(identityProgress)}%)</span>
            </div>
            <div className="w-full bg-zinc-900 h-2 rounded-full border border-zinc-800 overflow-hidden">
              <div 
                className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${identityProgress}%` }}
              />
            </div>
          </div>

          {/* Phase 3: 30 Days PM Loss Gone */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5 font-sans">
              <span className="text-zinc-300 font-semibold flex items-center gap-1.5">
                <span className="inline-flex w-2 h-2 rounded-full bg-emerald-500" />
                Phase 3: 30-Day Streak - PM Loss Eliminated (မွန်းလွဲပိုင်းအရှုံးများ လုံးဝပျောက်ကွယ်ရန်)
              </span>
              <span className="text-zinc-500 font-mono">{stats.currentStreak}/30 Days ({Math.round(professionalProgress)}%)</span>
            </div>
            <div className="w-full bg-zinc-900 h-2 rounded-full border border-zinc-800 overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${professionalProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
