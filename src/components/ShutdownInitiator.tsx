import { useState, FormEvent } from "react";
import { AlertCircle, ShieldAlert, Check, ShieldCheck, Power, Volume2, MonitorOff, HelpCircle } from "lucide-react";

interface ShutdownInitiatorProps {
  onFinalizeSession: (hasPmTrades: boolean, reflections: string) => void;
}

export default function ShutdownInitiator({ onFinalizeSession }: ShutdownInitiatorProps) {
  const [alarmChecked, setAlarmChecked] = useState(false);
  const [closedChecked, setClosedChecked] = useState(false);
  const [deskChecked, setDeskChecked] = useState(false);
  const [screenChecked, setScreenChecked] = useState(false);
  
  // Verdict: Did you enter any new trade after 11:30?
  const [hasPmTrades, setHasPmTrades] = useState<boolean | null>(null);
  const [reflections, setReflections] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const allChecksPassed = alarmChecked && closedChecked && deskChecked && screenChecked;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!allChecksPassed) {
      setErrorMessage("ကျေးဇူးပြု၍ Shutdown အဆင့်အားလုံးကို လိုက်နာပြီး အမှန်ခြစ်ပေးပါ။");
      return;
    }
    if (hasPmTrades === null) {
      setErrorMessage("11:30 နောက်ပိုင်း Trade ဝင်ခဲ့ခြင်း ရှိမရှိ ရွေးချယ်ပေးရန် လိုအပ်သည်။");
      return;
    }
    setErrorMessage("");
    onFinalizeSession(hasPmTrades, reflections);
  };

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 shadow-2xl max-w-2xl mx-auto overflow-hidden relative">
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-rose-500 to-amber-500" />
      
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg">
          <Power className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-zinc-100 tracking-wide font-sans">
            MANDATORY SHUTDOWN PROTOCOL & VERDICT
          </h2>
          <p className="text-xs text-zinc-400 font-mono">
            Action-Level Desk Exit Execution
          </p>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 mb-6 text-zinc-300 font-sans text-xs space-y-2.5 leading-relaxed">
        <p className="font-sans leading-relaxed text-zinc-300 text-sm">
          <strong>"11:30 နောက်ပိုင်း Trade မဝင်ပဲ နေမယ်"</strong> ဆိုတာ Intent ပဲ ရှိသေးတယ်။ 
          Emotion တက်လာတဲ့အချိန် Intent က မကာကွယ်နိုင်ပါဘူး။ Rule ကို အောက်ပါ Action Level အထိ ဆင်းရပါမယ်။
        </p>
        <p className="text-zinc-500 font-mono text-[10px]">
          * Please verify you have physically executed each action step below:
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ACTION ITEMS CHECKBOXES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Action 1 */}
          <div 
            onClick={() => setAlarmChecked(!alarmChecked)}
            className={`border rounded-xl p-4 cursor-pointer select-none transition-all flex items-start gap-3.5 ${
              alarmChecked 
                ? "bg-red-950/15 border-red-800/40 text-rose-400" 
                : "bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:border-zinc-700"
            }`}
          >
            <div className="mt-0.5">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-xs font-bold">11:25 AM</span>
                {alarmChecked && <span className="text-[10px] bg-red-900/30 text-red-400 px-1 rounded">EXEC✓</span>}
              </div>
              <h4 className="text-xs font-semibold text-zinc-200 mt-1">Setup/Hear Alarm</h4>
              <p className="text-[10px] text-zinc-500 mt-0.5 font-sans leading-snug">
                Alarm သံကြားပြီး Trade များအားလုံးကို ပိတ်သိမ်းရန် ပြင်ဆင်ပြီးဖြစ်ကြောင်း အတည်ပြုချက်။
              </p>
            </div>
          </div>

          {/* Action 2 */}
          <div 
            onClick={() => setClosedChecked(!closedChecked)}
            className={`border rounded-xl p-4 cursor-pointer select-none transition-all flex items-start gap-3.5 ${
              closedChecked 
                ? "bg-red-950/15 border-red-800/40 text-rose-400" 
                : "bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:border-zinc-700"
            }`}
          >
            <div className="mt-0.5">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-xs font-bold">11:30 AM</span>
                {closedChecked && <span className="text-[10px] bg-red-900/30 text-red-400 px-1 rounded">EXEC✓</span>}
              </div>
              <h4 className="text-xs font-semibold text-zinc-200 mt-1">TradingView & Broker Close</h4>
              <p className="text-[10px] text-zinc-500 mt-0.5 font-sans leading-snug">
                TradingView Tab နှင့် Broker systems များအားလုံးကို လုံးဝ ပိတ်လှောင်လိုက်ပါပြီ။
              </p>
            </div>
          </div>

          {/* Action 3 */}
          <div 
            onClick={() => setDeskChecked(!deskChecked)}
            className={`border rounded-xl p-4 cursor-pointer select-none transition-all flex items-start gap-3.5 ${
              deskChecked 
                ? "bg-red-950/15 border-red-800/40 text-rose-400" 
                : "bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:border-zinc-700"
            }`}
          >
            <div className="mt-0.5">
              <Volume2 className="w-5 h-5 -rotate-90" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-xs font-bold">11:35 AM</span>
                {deskChecked && <span className="text-[10px] bg-red-900/30 text-red-400 px-1 rounded">EXEC✓</span>}
              </div>
              <h4 className="text-xs font-semibold text-zinc-200 mt-1">Get up from Desk</h4>
              <p className="text-[10px] text-zinc-500 mt-0.5 font-sans leading-snug">
                ထိုင်ခုံမှ သစ်လွင်စွာ ထရပ်ပြီး အပြင်ဘက် သို့မဟုတ် ရေတစ်ခွက် သွားသောက်ပါပြီ။
              </p>
            </div>
          </div>

          {/* Action 4 */}
          <div 
            onClick={() => setScreenChecked(!screenChecked)}
            className={`border rounded-xl p-4 cursor-pointer select-none transition-all flex items-start gap-3.5 ${
              screenChecked 
                ? "bg-red-950/15 border-red-800/40 text-rose-400" 
                : "bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:border-zinc-700"
            }`}
          >
            <div className="mt-0.5">
              <MonitorOff className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-xs font-bold">11:40 AM</span>
                {screenChecked && <span className="text-[10px] bg-red-900/30 text-red-400 px-1 rounded">EXEC✓</span>}
              </div>
              <h4 className="text-xs font-semibold text-zinc-200 mt-1">Screens Off completely</h4>
              <p className="text-[10px] text-zinc-500 mt-0.5 font-sans leading-snug">
                ဖုန်း၊ ကွန်ပျူတာ၊ မျက်နှာပြင်မှန်သမျှကို လုံးဝ မကြည့်တော့ဘဲ အနားယူပါပြီ။
              </p>
            </div>
          </div>
        </div>

        {/* VERDICT QUESTIONS: CRITICAL */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center gap-2 text-zinc-200 text-sm font-bold font-sans">
            <HelpCircle className="w-4 h-4 text-amber-500 animate-pulse" />
            <span>Success Verdict for Today:</span>
          </div>

          <p className="text-xs text-zinc-400 leading-normal font-sans">
            ငွေဘယ်လောက်ရလဲဆိုတာ မဟုတ်ဘူး။ <strong>"11:30 ပြီးတော့ Trade ဝင်သေးလား?"</strong>
          </p>

          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* NO PM TRADES (SUCCESS) */}
            <button
              type="button"
              onClick={() => setHasPmTrades(false)}
              className={`py-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                hasPmTrades === false
                  ? "bg-emerald-950/50 border-emerald-500 text-emerald-400 shadow-md shadow-emerald-500/10"
                  : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-400"
              }`}
            >
              <div className="p-1 rounded-full bg-emerald-500/10 mb-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span>လုံးဝမဝင်ခဲ့ပါ (I Complied!)</span>
              <span className="text-[9px] font-mono opacity-65 uppercase">Verdict: SUCCESS</span>
            </button>

            {/* YES TRADES (FAILURE) */}
            <button
              type="button"
              onClick={() => setHasPmTrades(true)}
              className={`py-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                hasPmTrades === true
                  ? "bg-red-950/50 border-red-500 text-red-400 shadow-md shadow-red-500/10"
                  : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-400"
              }`}
            >
              <div className="p-1 rounded-full bg-red-500/10 mb-0.5">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <span>ဝင်မိခဲ့ပါတယ် (I Overtraded)</span>
              <span className="text-[9px] font-mono opacity-65 uppercase">Verdict: FAILED</span>
            </button>
          </div>
        </div>

        {/* REFLECTIONS AND SUBMIT */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5 font-sans">
              ယနေ့အတွက် တိုတိုတုတ်တုတ် ပြန်လည်သုံးသပ်ချက် (Day Review / Reflections):
            </label>
            <textarea
              rows={3}
              value={reflections}
              onChange={(e) => setReflections(e.target.value)}
              placeholder="e.g. 11:30 တွင် ချက်ချင်းထွက်နိုင်ခဲ့သည်။ စိတ်ထဲတွင် setup ဆက်ရှာချင်နေသော်လည်း Mandate ကို လိုက်နာခဲ့သည်။"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-red-500 font-sans"
            />
          </div>

          {errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-lg border border-red-900/30 bg-red-950/20 text-xs text-red-400">
              <AlertCircle className="w-4 h-4" />
              <span>{errorMessage}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={!allChecksPassed || hasPmTrades === null}
            className={`w-full py-3 rounded-lg font-bold text-xs tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 ${
              allChecksPassed && hasPmTrades !== null
                ? "bg-red-600 hover:bg-red-500 text-white hover:shadow-lg hover:shadow-red-500/10 cursor-pointer active:scale-95"
                : "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/20"
            }`}
          >
            <Power className="w-4 h-4" />
            FINALIZE SHUTDOWN PROTOCOL
          </button>
        </div>
      </form>
    </div>
  );
}
