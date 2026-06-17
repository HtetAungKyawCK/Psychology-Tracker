import { useState, useEffect, useCallback } from "react";
import { Trade, DaySession, StreakStats } from "./types";
import NYCClock from "./components/NYCClock";
import ContractTerminal from "./components/ContractTerminal";
import SessionDesk from "./components/SessionDesk";
import ShutdownInitiator from "./components/ShutdownInitiator";
import StreakBoard from "./components/StreakBoard";
import AICoachPanel from "./components/AICoachPanel";
import { Shield, Flame, Activity, Sparkles, BookOpen, User, RotateCcw, AlertTriangle } from "lucide-react";

export default function App() {
  const [currentSession, setCurrentSession] = useState<DaySession | null>(null);
  const [history, setHistory] = useState<DaySession[]>([]);
  const [activeTab, setActiveTab] = useState<"DESK" | "STREAKS" | "COACH">("DESK");
  const [currentTimeMinutes, setCurrentTimeMinutes] = useState<number>(0);
  const [forceShutdownView, setForceShutdownView] = useState<boolean>(false);

  // Get current date string in standard format
  const getTodayDateStr = () => {
    return new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).replace(/\//g, "-"); // E.g., "06-17-2026"
  };

  // Recalculate streak statistics from completed history
  const calculateStats = useCallback((allHistory: DaySession[], activeSession: DaySession | null): StreakStats => {
    // Sort chronological: oldest to newest
    const sorted = [...allHistory].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    let currentStreak = 0;
    let highestStreak = 0;
    let compliantDays = 0;

    // Evaluate past days
    sorted.forEach((day) => {
      if (day.contractSigned) {
        if (!day.hasPmSessionTrades) {
          compliantDays += 1;
          currentStreak += 1;
        } else {
          currentStreak = 0; // broken
        }
        if (currentStreak > highestStreak) {
          highestStreak = currentStreak;
        }
      }
    });

    // Handle today's state if signed and not violated yet
    if (activeSession && activeSession.contractSigned) {
      if (!activeSession.hasPmSessionTrades) {
        // Active session is currently compliant
        // We only add to active streak to encourage them!
        currentStreak += 1;
        compliantDays += 1;
        if (currentStreak > highestStreak) {
          highestStreak = currentStreak;
        }
      } else {
        currentStreak = 0; // broken today
      }
    }

    const totalDays = allHistory.filter(d => d.contractSigned).length + (activeSession?.contractSigned ? 1 : 0);

    return {
      currentStreak,
      highestStreak,
      totalDays,
      compliantDays
    };
  }, []);

  // 1. Initial State Loading from LocalStorage on Mount
  useEffect(() => {
    const todayStr = getTodayDateStr();
    
    // Load historical sessions
    const savedHistory = localStorage.getItem("trading_history");
    const parsedHistory: DaySession[] = savedHistory ? JSON.parse(savedHistory) : [];
    setHistory(parsedHistory);

    // Load today's active session
    const savedActive = localStorage.getItem("trading_active_session");
    let activeData: DaySession | null = null;

    if (savedActive) {
      const parsed: DaySession = JSON.parse(savedActive);
      if (parsed.date === todayStr) {
        activeData = parsed;
      } else {
        // Previous day's session exists but it's a new calendar date!
        // Push old session into history if not already there, then start fresh
        const alreadyInHistory = parsedHistory.some(h => h.date === parsed.date);
        if (!alreadyInHistory && parsed.contractSigned) {
          const updatedHistory = [...parsedHistory, parsed];
          localStorage.setItem("trading_history", JSON.stringify(updatedHistory));
          setHistory(updatedHistory);
        }
        // Start fresh active session for today
        activeData = getNewSessionTemplate(todayStr);
      }
    } else {
      activeData = getNewSessionTemplate(todayStr);
    }

    setCurrentSession(activeData);
    localStorage.setItem("trading_active_session", JSON.stringify(activeData));
  }, []);

  const getNewSessionTemplate = (dateStr: string): DaySession => {
    return {
      date: dateStr,
      contractSigned: false,
      preMarketReady: false,
      trades: [],
      complianceScore: 100,
      shutdownCompleted: {
        alarm1125: false,
        closed1130: false,
        desk1135: false,
        screen1140: false,
      },
      hasPmSessionTrades: false,
      maxLossReached: false,
      complianceStatus: "EXCELLENT",
      reflections: "",
    };
  };

  // Save active session helper
  const saveSessionState = (session: DaySession) => {
    setCurrentSession(session);
    localStorage.setItem("trading_active_session", JSON.stringify(session));
  };

  // 2. Handle Clock Time Updates for Automatic Session Stages
  const handleTimeUpdate = useCallback((totalMinutes: number) => {
    setCurrentTimeMinutes(totalMinutes);
    
    // 11:25 AM is (11 * 60) + 25 = 685 minutes.
    // If trade session is active and clock ticks past 11:25 AM, 
    // we should lock trade logging and force the Shutdown screen.
    const cutoffMinutes = 11 * 60 + 25;
    if (totalMinutes >= cutoffMinutes && currentSession?.contractSigned && !forceShutdownView) {
      // Auto-unlock shutdown panel when time ticks past 11:25 AM
      setForceShutdownView(true);
    }
  }, [currentSession, forceShutdownView]);

  // 3. User Signs Contract
  const handleSignContract = () => {
    if (!currentSession) return;

    const updated = {
      ...currentSession,
      contractSigned: true,
      preMarketReady: true,
    };
    saveSessionState(updated);
  };

  // 4. Log trade execution
  const handleAddTrade = (newTradeData: Omit<Trade, "id">) => {
    if (!currentSession) return;

    const newTrade: Trade = {
      ...newTradeData,
      id: Math.random().toString(36).substring(2, 9),
    };

    const updatedTrades = [...currentSession.trades, newTrade];
    
    // Check if total direct USD sum hits daily max loss limit of -$500
    const totalPnL = updatedTrades.reduce((sum, t) => sum + t.pnlAmount, 0);
    const isMaxLoss = totalPnL <= -500;

    const updated = {
      ...currentSession,
      trades: updatedTrades,
      maxLossReached: isMaxLoss,
    };

    saveSessionState(updated);
  };

  // Remove trade
  const handleRemoveTrade = (tradeId: string) => {
    if (!currentSession) return;
    const updatedTrades = currentSession.trades.filter((t) => t.id !== tradeId);
    const totalPnL = updatedTrades.reduce((sum, t) => sum + t.pnlAmount, 0);
    const isMaxLoss = totalPnL <= -500;

    const updated = {
      ...currentSession,
      trades: updatedTrades,
      maxLossReached: isMaxLoss,
    };
    saveSessionState(updated);
  };

  // Toggle trade quality/acceptance checkbox
  const handleToggleAcceptance = (tradeId: string) => {
    if (!currentSession) return;
    const updatedTrades = currentSession.trades.map((t) =>
      t.id === tradeId ? { ...t, acceptedOutcome: !t.acceptedOutcome } : t
    );
    const updated = {
      ...currentSession,
      trades: updatedTrades,
    };
    saveSessionState(updated);
  };

  // Quick emergency logs when temptation modal is triggered
  const handleEmergencyTrigger = (temptationReason: string, coachReply: string) => {
    // We can save any notes to currentSession Reflections or log it to help tracks compliance
    if (!currentSession) return;
    const notesEntry = `[Temptation Shield Triggered at ${new Date().toLocaleTimeString()}]: User felt "${temptationReason}". Coach response: "${coachReply.substring(0, 50)}..."\n`;
    const updated = {
      ...currentSession,
      reflections: (currentSession.reflections || "") + notesEntry,
    };
    saveSessionState(updated);
  };

  // 5. Finalize Shutdown Protocol
  const handleFinalizeSession = (violatedPmTrades: boolean, finalReflections: string) => {
    if (!currentSession) return;

    // Calculate quality and final compliance score
    // Compliant Day is defined by ZERO PM trades.
    // If they close TV/Broker, Alarm, Desk, Screen properly, they get extra quality score.
    const score = violatedPmTrades ? 0 : 100;
    const complianceStatus: DaySession["complianceStatus"] = violatedPmTrades
      ? "FAILED"
      : currentSession.trades.some(t => !t.acceptedOutcome)
      ? "COMPLIANT"
      : "EXCELLENT";

    const completedSession: DaySession = {
      ...currentSession,
      hasPmSessionTrades: violatedPmTrades,
      reflections: (currentSession.reflections || "") + finalReflections,
      complianceScore: score,
      complianceStatus,
      shutdownCompleted: {
        alarm1125: true,
        closed1130: true,
        desk1135: true,
        screen1140: true,
      },
    };

    // Append to trade journal history database
    const updatedHistory = [...history.filter(h => h.date !== completedSession.date), completedSession];
    setHistory(updatedHistory);
    localStorage.setItem("trading_history", JSON.stringify(updatedHistory));

    // Clear current session to force a visual locked completed state
    saveSessionState(completedSession);
    setForceShutdownView(false);
    setActiveTab("STREAKS");
  };

  // Clear tracking data for troubleshooting / development
  const handleResetApp = () => {
    if (confirm("မင်းရဲ့ trading logs တွေ၊ streak stats တွေအားလုံးကို လုံးဝ ဖျက်သိမ်းပြီး startup setup ကို ပြန်သွားချင်တာ သေချာလား?")) {
      localStorage.removeItem("trading_history");
      localStorage.removeItem("trading_active_session");
      const fresh = getNewSessionTemplate(getTodayDateStr());
      setCurrentSession(fresh);
      setHistory([]);
      setForceShutdownView(false);
      setActiveTab("DESK");
    }
  };

  // Calculate current compiled statistics
  const stats = calculateStats(history, currentSession);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* GLOBAL BACKGROUND ELEMENTS (High Quality Grid Patterns) */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e1e24_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-20" />

      {/* TOP DESK BANNER MAIN */}
      <header className="bg-zinc-900 border-b border-zinc-800/80 sticky top-0 z-40 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-indigo-500 to-rose-500 p-0.5 shadow-lg shadow-amber-500/5">
              <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center text-amber-400">
                <Shield className="w-5 h-5 animate-spin-slow" />
              </div>
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-wider font-mono text-zinc-100 uppercase">
                TRADING DISCIPLINE COMPANION
              </h1>
              <p className="text-[10px] text-zinc-400 font-sans tracking-tight uppercase">
                Professional Trading Contract & Habit Coach Suite
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" />
              <span className="text-zinc-400 font-mono text-xs">Compliance Streak:</span>
              <span className="text-amber-400 font-mono font-bold text-xs">{stats.currentStreak} Days</span>
            </div>
            <button
              onClick={handleResetApp}
              title="Reset data"
              className="text-zinc-600 hover:text-red-400 p-1.5 rounded transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT CANVAS */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 space-y-6">
        {/* NY REAL TIME CENTRAL WATCHDOG CLOCK */}
        <NYCClock onTimeUpdate={handleTimeUpdate} />

        {currentSession && !currentSession.contractSigned ? (
          /* NOT SIGNED ROADBLOCK: Force Alignment Contract */
          <div className="py-4 animate-in fade-in duration-300">
            <ContractTerminal onSignContract={handleSignContract} />
          </div>
        ) : (
          /* SIGNED ROADBLOCK SUCCESS: Enter Active Dashboard */
          currentSession && (
            <div className="space-y-6 animate-in fade-in duration-400">
              {/* PRIMARY TAB SELECTORS */}
              <div className="flex border-b border-zinc-850 gap-2 overflow-x-auto">
                <button
                  onClick={() => {
                    setForceShutdownView(false);
                    setActiveTab("DESK");
                  }}
                  className={`px-4 py-2.5 text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 border-b-2 cursor-pointer ${
                    activeTab === "DESK" && !forceShutdownView
                      ? "border-amber-500 text-amber-400 font-bold"
                      : "border-transparent text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <Activity className="w-4 h-4" />
                  Active Trading Desk
                </button>

                <button
                  onClick={() => {
                    setForceShutdownView(false);
                    setActiveTab("STREAKS");
                  }}
                  className={`px-4 py-2.5 text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 border-b-2 cursor-pointer ${
                    activeTab === "STREAKS" && !forceShutdownView
                      ? "border-amber-500 text-amber-400 font-bold"
                      : "border-transparent text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  streaks & history
                </button>

                <button
                  onClick={() => {
                    setForceShutdownView(false);
                    setActiveTab("COACH");
                  }}
                  className={`px-4 py-2.5 text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 border-b-2 cursor-pointer ${
                    activeTab === "COACH" && !forceShutdownView
                      ? "border-amber-500 text-amber-400 font-bold"
                      : "border-transparent text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  Hedge Fund AI Coach
                </button>

                {/* Force Step-down trigger button at the right corner */}
                <button
                  onClick={() => setForceShutdownView(true)}
                  className={`ml-auto px-4 py-2 rounded text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    forceShutdownView
                      ? "bg-red-600 text-white shadow-lg shadow-red-600/10"
                      : "bg-red-950/20 text-red-400 border border-red-900/30 hover:bg-red-950/40"
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
                  SHUTDOWN PROTOCOL
                </button>
              </div>

              {/* DYNAMIC VIEWPORT MOUNTING */}
              <div className="min-h-[460px]">
                {forceShutdownView ? (
                  <div className="animate-in slide-in-from-bottom-4 duration-300">
                    <ShutdownInitiator onFinalizeSession={handleFinalizeSession} />
                  </div>
                ) : activeTab === "DESK" ? (
                  // If they have already completed the session shutdown, lock desk output
                  currentSession.shutdownCompleted.closed1130 ? (
                    <div className="max-w-lg mx-auto text-center border border-zinc-800 rounded-xl p-8 bg-zinc-950 space-y-4">
                      <div className="w-12 h-12 bg-red-950/20 text-red-500 border border-red-900/30 rounded-full flex items-center justify-center mx-auto">
                        <User className="w-6 h-6" />
                      </div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-100 font-sans">
                        Session Lock: CLOSED FOR TODAY
                      </h3>
                      <p className="text-xs text-zinc-400 leading-relaxed font-sans text-justify">
                        ယနေ့အတွက် Trading Session အား Shutdown Protocol များဖြင့် အပြည့်အဝ ပိတ်သိမ်းပြီးစီးပြီး ဖြစ်သည်။ 
                        ၁၁:၃၀ နောက်ပိုင်း မဝင်တော့ဘဲ စောင့်စည်းနိုင်ခဲ့သဖြင့် အထူးပင် ချီးကျူးအပ်ပါသည်။ 
                        ရှေ့ဆက် အနာဂတ် Trade ၁၀၀ အတွက် ဤ Identity ကို ထိန်းသိမ်းပါ။
                      </p>
                      <button
                        onClick={() => setActiveTab("STREAKS")}
                        className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded px-4 py-2 text-xs font-semibold cursor-pointer"
                      >
                        ခရီးစဉ်အချက်အလက်များ သွားကြည့်ရန်
                      </button>
                    </div>
                  ) : (
                    <div className="animate-in fade-in duration-300">
                      <SessionDesk
                        currentSession={currentSession}
                        onAddTrade={handleAddTrade}
                        onRemoveTrade={handleRemoveTrade}
                        onToggleAcceptance={handleToggleAcceptance}
                        onEmergencyTrigger={handleEmergencyTrigger}
                      />
                    </div>
                  )
                ) : activeTab === "STREAKS" ? (
                  <div className="animate-in fade-in duration-300">
                    <StreakBoard history={history} stats={stats} />
                  </div>
                ) : (
                  <div className="animate-in fade-in duration-300">
                    <AICoachPanel currentSession={currentSession} history={history} />
                  </div>
                )}
              </div>
            </div>
          )
        )}
      </main>

      {/* FOOTER METRICS AND SECURITY DISCLAIMER */}
      <footer className="bg-zinc-950 border-t border-zinc-900 py-6 mt-12 text-center text-[10px] text-zinc-500 font-mono tracking-widest uppercase">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>PROFESSIONAL RISK DESK // NO REVENGE LOOP</span>
          <span>© 2026 TRADING DISCIPLINE COMPANION DEPLOYED</span>
        </div>
      </footer>
    </div>
  );
}
