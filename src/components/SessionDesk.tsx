import { useState, FormEvent } from "react";
import { Trade, DaySession } from "../types";
import { 
  History, 
  Trash2, 
  Flame, 
  AlertOctagon, 
  CheckCircle, 
  Crosshair, 
  Plus, 
  User, 
  MessageSquare, 
  Send,
  Loader2,
  Anchor,
  X,
  Footprints
} from "lucide-react";

interface SessionDeskProps {
  currentSession: DaySession;
  onAddTrade: (trade: Omit<Trade, "id">) => void;
  onRemoveTrade: (id: string) => void;
  onToggleAcceptance: (id: string) => void;
  onEmergencyTrigger: (reason: string, reply: string) => void;
}

export default function SessionDesk({
  currentSession,
  onAddTrade,
  onRemoveTrade,
  onToggleAcceptance,
  onEmergencyTrigger,
}: SessionDeskProps) {
  // Trade Log Fields
  const [setupName, setSetupName] = useState("");
  const [pnl, setPnl] = useState<"TP" | "SL" | "BE">("SL");
  const [pnlAmount, setPnlAmount] = useState<number>(100);
  const [acceptedOutcome, setAcceptedOutcome] = useState(true);
  const [notes, setNotes] = useState("");

  // Panic / Temptation Modal State
  const [showTemptationModal, setShowTemptationModal] = useState(false);
  const [temptationInput, setTemptationInput] = useState("");
  const [coachResponse, setCoachResponse] = useState("");
  const [isLoadingCoach, setIsLoadingCoach] = useState(false);

  // Stats calculation
  const totalPnL = currentSession.trades.reduce((acc, t) => acc + t.pnlAmount, 0);
  const isLossCapReached = totalPnL <= -500;

  const handleAddTrade = (e: FormEvent) => {
    e.preventDefault();
    if (!setupName.trim()) return;

    // Convert SL to a negative number, TP to positive, and BE to 0
    const finalAmount = pnl === "SL" ? -Math.abs(pnlAmount) : pnl === "BE" ? 0 : Math.abs(pnlAmount);

    onAddTrade({
      time: new Date().toLocaleTimeString("en-US", {
        timeZone: "America/New_York",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
      setupName,
      pnl,
      pnlAmount: finalAmount,
      acceptedOutcome,
      notes,
    });

    // Reset Form
    setSetupName("");
    setNotes("");
    setPnl("SL");
    setPnlAmount(100);
    setAcceptedOutcome(true);
  };

  const handlePnlChange = (type: "TP" | "SL" | "BE") => {
    setPnl(type);
    if (type === "SL") {
      setPnlAmount(100);
    } else if (type === "BE") {
      setPnlAmount(0);
    } else {
      setPnlAmount(150); // Default TP suggestion is $150
    }
  };

  const triggerCoachTemptation = async () => {
    if (!temptationInput.trim()) return;
    setIsLoadingCoach(true);
    setCoachResponse("");
    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: temptationInput,
          context: {
            currentSession,
            totalPnL,
            time: new Date().toLocaleTimeString("en-US", { timeZone: "America/New_York" }),
          },
          type: "temptation",
        }),
      });
      const data = await res.json();
      if (data.reply) {
        setCoachResponse(data.reply);
        onEmergencyTrigger(temptationInput, data.reply);
      } else {
        setCoachResponse("Maybe. But it is outside my fund mandate. 11:30 AM ပြီးနောက် Trade ခွင့်မရှိပါ။");
      }
    } catch (err) {
      console.error(err);
      setCoachResponse("Maybe. But it is outside my fund mandate. 11:30 AM ပြီးနောက် Trade ခွင့်မရှိပါ။ Desk ကနေ ထပါတော့။");
    } finally {
      setIsLoadingCoach(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* LEFT COLUMN: ACTIVE LOGGER (7 cols) */}
      <div className="lg:col-span-8 space-y-6">
        {/* SESSION OVERVIEW HUD */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 shadow-lg flex flex-wrap items-center justify-between gap-4">
          <div className="flex h-12 items-center gap-4">
            <div className={`p-0.5 rounded-full ${totalPnL >= 0 ? "bg-emerald-500/20" : "bg-red-500/20"}`}>
              <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-xs font-mono border ${
                totalPnL >= 0 ? "bg-emerald-950 border-emerald-500/40 text-emerald-400" : "bg-red-950 border-red-500/40 text-red-500"
              }`}>
                {totalPnL >= 0 ? "+" : ""}${Math.abs(totalPnL).toFixed(0)}
              </div>
            </div>
            <div>
              <span className="text-zinc-500 font-mono text-[10px] tracking-wider uppercase block">Net Closed Daily PnL</span>
              <span className={`text-lg font-bold font-mono tracking-tight ${totalPnL >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {totalPnL >= 0 ? "+" : ""}${totalPnL.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="text-right border-r border-zinc-800 pr-4">
              <span className="text-zinc-500 text-[10px] uppercase font-mono block">Executed Trades</span>
              <span className="text-zinc-200 font-mono font-bold text-lg">{currentSession.trades.length}</span>
            </div>
            <div className="text-right">
              <span className="text-zinc-500 text-[10px] uppercase font-mono block">Max Loss Cap</span>
              <span className="text-red-400 font-mono font-bold text-xs">
                -$500 Plan (Auto-Stop)
              </span>
            </div>
          </div>
        </div>

        {/* LOG A NEW ENTRY FORM */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-zinc-200 tracking-wide">
                AM SESSION TRADE ENTRY LOGGER
              </h3>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">NY Session Only</span>
          </div>

          {isLossCapReached ? (
            <div className="p-4 border border-rose-950 bg-rose-950/20 text-rose-400 rounded-lg text-xs leading-relaxed space-y-2">
              <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-rose-500">
                <AlertOctagon className="w-4 h-4" />
                Max daily loss limit triggered!
              </div>
              <p>
                Closed PnL $500 ထက်ပိုပြီး အရှုံးမခံသည့် Contract စည်းကမ်းချက်ကို ချိုးဖောက်လုနီးပါး သို့မဟုတ် ချိုးဖောက်ထားပြီး ဖြစ်ပါသည်။ 
                Hedge Fund Contract စည်းကမ်းအရ ယနေ့အတွက် Trade setup အသစ်ရှာဖွေခြင်းကို ချက်ချင်းရပ်တန့်ရမည်။
                ထပ်မံဝင်ရောက်ပါက ၎င်းသည် သင့်အကောင့် ပျက်စီးစေမည့် စည်းကမ်းချက်ချိုးဖောက်မှု (PM Revenge Loop) သာ ဖြစ်လိမ့်မည်။
              </p>
            </div>
          ) : (
            <form onSubmit={handleAddTrade} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Setup Input */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                    Setup Model (e.g. FVG, MSS, Liquidity Sweep)
                  </label>
                  <input
                    type="text"
                    value={setupName}
                    onChange={(e) => setSetupName(e.target.value)}
                    placeholder="e.g., FVG 10am Displacement"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                {/* PNL Type Toggles */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                    PnL Outcome
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["TP", "BE", "SL"].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => handlePnlChange(type as "TP" | "SL" | "BE")}
                        className={`py-1.5 rounded text-xs font-mono font-bold border transition-all ${
                          pnl === type
                            ? type === "TP"
                              ? "bg-emerald-950 border-emerald-500 text-emerald-400"
                              : type === "BE"
                              ? "bg-zinc-800 border-zinc-600 text-zinc-300"
                              : "bg-red-950 border-red-500 text-red-400"
                            : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-400"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* USD PnL Value entry */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                    {pnl === "SL" ? "Loss Cash Amount (အရှုံးပမာဏ)" : pnl === "TP" ? "Profit Cash Amount (အမြတ်ပမာဏ)" : "Breakeven Amount"}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-zinc-550 font-mono text-xs">$</span>
                    <input
                      type="number"
                      min="0"
                      disabled={pnl === "BE"}
                      value={pnl === "BE" ? 0 : pnlAmount === 0 ? "" : pnlAmount}
                      onChange={(e) => setPnlAmount(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-1.5 pl-7 text-xs font-mono text-zinc-100 focus:outline-none focus:border-indigo-500"
                      placeholder="Enter USD value"
                      required={pnl !== "BE"}
                    />
                    {pnl === "SL" && (
                      <span className="text-[10px] text-red-500/80 block mt-1 font-mono">
                        Note: ဤပမာဏကို စုစုပေါင်းမှတ်တမ်းတွင် အနှုတ် (-${pnlAmount || 0}) အဖြစ် စာရင်းသွင်းပါမည်။
                      </span>
                    )}
                  </div>
                </div>

                {/* Outcome Acceptance Switch */}
                <div className="bg-zinc-950 border border-zinc-800/60 rounded px-4 py-2.5 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-zinc-300 block">Accept the Outcome?</span>
                    <span className="text-[10px] text-zinc-500 block leading-tight">ရလဒ်ကို အပြည့်အဝလက်ခံပါသည်</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={acceptedOutcome}
                    onChange={(e) => setAcceptedOutcome(e.target.checked)}
                    className="accent-emerald-500 w-4 h-4 cursor-pointer"
                  />
                </div>
              </div>

              {/* Note details */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                  Execution/Reflections notes (Keep it brief)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Perfect wait, executed on lower TF BOS. Zero hesitation."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-500 text-black py-2.5 rounded font-bold text-xs tracking-wider uppercase hover:bg-emerald-400 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1 shadow-lg shadow-emerald-500/10"
              >
                <Plus className="w-4 h-4" />
                Log Executed Active Trade
              </button>
            </form>
          )}
        </div>

        {/* LOG SUMMARY TABLE */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-zinc-400" />
              <h3 className="text-sm font-bold text-zinc-200 tracking-wide">
                TODAY'S TRADE EXECUTION LOG
              </h3>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">{currentSession.trades.length} trades recorded</span>
          </div>

          {currentSession.trades.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-zinc-800 rounded-lg text-zinc-600 text-xs font-mono uppercase bg-zinc-950/20">
              No executions yet. Waiting for trade setups inside window...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 font-mono tracking-wider">
                    <th className="py-2.5 font-medium">TIME</th>
                    <th className="py-2.5 font-medium">SETUP MODEL</th>
                    <th className="py-2.5 font-medium text-center">PNL</th>
                    <th className="py-2.5 font-medium text-right font-sans">PROFIT / LOSS</th>
                    <th className="py-2.5 font-medium text-center">ACCEPTANCE</th>
                    <th className="py-2.5 font-medium text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {currentSession.trades.map((trade) => (
                    <tr key={trade.id} className="text-zinc-300 font-mono hover:bg-zinc-800/20">
                      <td className="py-3 text-zinc-500 font-sm">{trade.time}</td>
                      <td className="py-3 font-sans font-medium text-zinc-200">
                        {trade.setupName}
                        {trade.notes && (
                          <span className="block text-[10px] text-zinc-500 font-sans font-normal mt-0.5 max-w-xs truncate">
                            {trade.notes}
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-center">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          trade.pnl === "TP"
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-500/20"
                            : trade.pnl === "BE"
                            ? "bg-zinc-800 text-zinc-300 border border-zinc-700/20"
                            : "bg-red-950 text-red-400 border border-red-500/20"
                        }`}>
                          {trade.pnl}
                        </span>
                      </td>
                      <td className={`py-3 text-right font-bold ${trade.pnlAmount >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {trade.pnlAmount >= 0 ? "+" : ""}${trade.pnlAmount.toFixed(2)}
                      </td>
                      <td className="py-3 text-center">
                        <button
                          onClick={() => onToggleAcceptance(trade.id)}
                          className={`px-2 py-0.5 rounded text-[10px] font-sans font-semibold transition-all border ${
                            trade.acceptedOutcome
                              ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10"
                              : "bg-amber-500/5 text-amber-500 border-amber-500/20 hover:bg-amber-500/10"
                          }`}
                        >
                          {trade.acceptedOutcome ? "Acccepted ✓" : "Resisted !"}
                        </button>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => onRemoveTrade(trade.id)}
                          className="text-zinc-600 hover:text-red-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: EMERGENCY TEMPTATION / EMOTION TOOL (4 cols) */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-gradient-to-br from-red-950/40 to-zinc-950 border border-red-900/30 rounded-xl p-5 shadow-lg relative overflow-hidden">
          {/* Animated red circle shadow */}
          <div className="absolute -top-12 -right-12 w-24 h-24 bg-red-500/5 rounded-full blur-xl" />
          
          <div className="flex items-center gap-2.5 mb-3.5 text-red-400">
            <Flame className="w-5 h-5 animate-bounce" />
            <span className="text-xs uppercase font-mono tracking-wider font-bold">Emotion Check & Shield</span>
          </div>

          <h4 className="text-sm font-bold text-zinc-100 font-sans leading-snug mb-2">
            ခေါင်းက "Setup တစ်ခုရှိသေးတယ် ဝင်လိုက်ဦး" ဟု တိုက်တွန်းနေပါသလား?
          </h4>
          
          <p className="text-xs text-zinc-400 leading-normal mb-4 font-sans text-justify">
            စိတ်မရှည်ခြင်း (Impatience) သို့မဟုတ် ရှုံးသွားသည်ကို လက်မခံနိုင်ခြင်း (Tilt) 
            ဖြစ်လာသောအခါ trade ဝင်ခလုတ်ကို မနှိပ်မိစေရန် ဤခလုတ်ကို ချက်ချင်းနှိပ်ပါ။ 
            ဤခလုတ်ကို ကလိစ်နှိပ်လိုက်ခြင်းသည် ကြီးမားသော စည်းကမ်းထိန်းသိမ်းမှု အောင်ပွဲ ဖြစ်သည်။
          </p>

          <button
            onClick={() => {
              setShowTemptationModal(true);
              setTemptationInput("");
              setCoachResponse("");
            }}
            className="w-full bg-red-900/40 text-red-300 hover:bg-red-900/60 active:scale-95 text-xs font-bold border border-red-800 py-3 rounded-lg flex items-center justify-center gap-2 cursor-pointer shadow-inner transition-all tracking-wider uppercase"
          >
            <AlertOctagon className="w-4 h-4" />
            TRIGGER EMERGENCY BRAIN SHIELD
          </button>
        </div>

        {/* RISK PRINCIPLES CHEATSHEET */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <Anchor className="w-4 h-4 text-indigo-400" />
            <h4 className="text-xs font-bold text-zinc-200 tracking-wider uppercase font-sans">
              Allocators Cheat Sheet
            </h4>
          </div>
          <ul className="text-xs text-zinc-400 space-y-2.5 list-none font-sans">
            <li className="flex items-start gap-2 leading-relaxed">
              <span className="text-amber-500 font-mono">▸</span>
              <span><strong>Decision Quality &gt; PnL:</strong> ကောင်းမွန်သော Decision လုပ်တတ်ခြင်းသည် နောက်ထပ် Trade ၁၀၀ အတွက် Equity Curve ကို တည်ဆောက်ပေးသည်။</span>
            </li>
            <li className="flex items-start gap-2 leading-relaxed">
              <span className="text-amber-500 font-mono">▸</span>
              <span><strong>The PM Revenge Loop:</strong> 11:30 AM နောက်ပိုင်းတွင် setup များသည် အများအားဖြင့် Liquidity low ဖြစ်ပြီး, noise သာရှိသဖြင့် trade ဝင်လျှင် စည်းကမ်းပျက်ပြားစေသည်။</span>
            </li>
            <li className="flex items-start gap-2 leading-relaxed">
              <span className="text-amber-500 font-mono">▸</span>
              <span><strong>Loss Acceptance:</strong> Loss ကို လက်ခံလိုက်ခြင်းသည် Trader ကြီးများ၏ အကြီးမားဆုံး Edge ဖြစ်သည်။ Loss ကို Recover လုပ်ရန် မကြိုးစားပါနှင့်။</span>
            </li>
          </ul>
        </div>
      </div>

      {/* EMERGENCY COPING MODAL */}
      {showTemptationModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-red-900/50 rounded-2xl w-full max-w-xl shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Visual warning border bar */}
            <div className="h-1.5 bg-gradient-to-r from-red-600 via-amber-500 to-red-600" />
            
            <button
              onClick={() => setShowTemptationModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-6">
              <div className="flex items-center gap-3 text-red-500 mb-4">
                <AlertOctagon className="w-6 h-6 animate-pulse" />
                <div>
                  <h3 className="text-base font-bold text-zinc-100 font-sans uppercase tracking-wider">
                    Emergency Fund Mandate Shield Active
                  </h3>
                  <p className="text-[10px] text-zinc-500 font-mono uppercase">Hedge Fund Allocation Defense System</p>
                </div>
              </div>

              {/* Large Psychological Core Message */}
              <div className="bg-red-950/20 border border-red-900/30 rounded-xl p-4 mb-5 text-center">
                <span className="text-[10px] text-red-400 font-mono uppercase tracking-widest block mb-1">Response Protocol</span>
                <span className="text-lg md:text-xl font-mono text-amber-400 font-bold tracking-tight block">
                  "Maybe. But it is outside my fund mandate."
                </span>
                <span className="text-xs text-zinc-400 mt-2 block font-sans">
                  စည်းကမ်းပြင်ပ trade လုပ်ခြင်းသည် သင့်အသက်မွေးဝမ်းကျောင်းကို ဖျက်ဆီးမည့် တစ်ခုတည်းသော အရာဖြစ်သည်။
                </span>
              </div>

              {/* Interaction with AI Coach */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 font-sans">
                    သင့်စိတ်ခံစားမှု သို့မဟုတ် ခေါင်းထဲမှ အတွေးကို ရေးချလိုက်ပါ (Vape/write your emotion):
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={temptationInput}
                      onChange={(e) => setTemptationInput(e.target.value)}
                      placeholder="e.g. SL ထိသွားလို့ နောက်တစ် trade ပြန်ဝင်ချင်လို့... / PM setup တစ်ခု တွေ့နေလို့"
                      className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-red-500 font-sans"
                    />
                    <button
                      onClick={triggerCoachTemptation}
                      disabled={isLoadingCoach || !temptationInput.trim()}
                      className="bg-red-600 hover:bg-red-500 text-white disabled:bg-zinc-800 disabled:text-zinc-600 px-3 rounded text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    >
                      {isLoadingCoach ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* AI response box */}
                {coachResponse && (
                  <div className="bg-zinc-900 border border-zinc-800/80 rounded-xl p-4 max-h-48 overflow-y-auto space-y-2">
                    <div className="flex items-center gap-1.5 text-xs text-amber-400 font-mono">
                      <User className="w-3.5 h-3.5" />
                      <span>Hedge Fund Allocator Coach:</span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed font-sans whitespace-pre-wrap text-justify">
                      {coachResponse}
                    </p>
                  </div>
                )}

                <div className="border-t border-zinc-900 pt-3 flex flex-wrap gap-2 items-center justify-between text-xs font-mono text-zinc-500">
                  <div className="flex items-center gap-1">
                    <Footprints className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                    <span className="font-sans">ထိုင်ခုံမှထကာ ရေတစ်ခွက်သောက်ပါ</span>
                  </div>
                  <button
                    onClick={() => setShowTemptationModal(false)}
                    className="text-zinc-400 hover:text-white px-3 py-1 font-sans font-bold border border-zinc-800 rounded hover:bg-zinc-950 transition-colors cursor-pointer"
                  >
                    I Comply & Stay Locked Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
