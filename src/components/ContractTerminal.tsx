import { useState, FormEvent } from "react";
import { Shield, Check, Landmark, Award, AlertCircle } from "lucide-react";

interface ContractTerminalProps {
  onSignContract: () => void;
}

export default function ContractTerminal({ onSignContract }: ContractTerminalProps) {
  const [agreedEdge, setAgreedEdge] = useState(false);
  const [agreedHours, setAgreedHours] = useState(false);
  const [agreedOutcome, setAgreedOutcome] = useState(false);
  const [agreedLoss, setAgreedLoss] = useState(false);
  const [agreedShutdown, setAgreedShutdown] = useState(false);
  const [signature, setSignature] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const allAgreed = agreedEdge && agreedHours && agreedOutcome && agreedLoss && agreedShutdown;

  const handleSigning = (e: FormEvent) => {
    e.preventDefault();
    if (!allAgreed) {
      setErrorMsg("ကျေးဇူးပြု၍ စည်းကမ်းချက်အားလုံးကို သဘောတူညီပေးပါ။ (Please agree to all mandates first.)");
      return;
    }
    if (!signature.trim()) {
      setErrorMsg("Trade desk မထိုင်ခင် သင့်အမည် သို့မဟုတ် လက်မှတ် ရေးထိုးရန် လိုအပ်သည်။");
      return;
    }
    setErrorMsg("");
    onSignContract();
  };

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 shadow-2xl relative overflow-hidden max-w-2xl mx-auto">
      {/* Visual Header Grid Accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-indigo-500 to-emerald-500" />
      
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-lg">
          <Shield className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-zinc-100 tracking-wide font-sans">
            PROFESSIONAL TRADING MANDATE & CONTRACT
          </h2>
          <p className="text-xs text-zinc-400 font-mono">
            Hedge Fund Allocator Rules & Risk Matrix
          </p>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 mb-6 leading-relaxed text-zinc-300 font-sans text-sm space-y-4">
        <p className="font-sans leading-relaxed text-zinc-300">
          ယနေ့ Trade Desktop မထိုင်ခင် Professional Trading Contract ကို အတည်ပြု လက်မှတ်ရေးထိုးရမည်။
          ဤစာချုပ်သည် ငွေရှာရန် မဟုတ်ဘဲ <strong className="text-amber-400">AM Session Edge</strong> ကို စည်းကမ်းတကျ 
          Execute လုပ်ရန်နှင့် စိတ်ခံစားချက်နောက် မပါဘဲ 11:30 AM တွင် လုံးဝ ရပ်တန့်နိုင်ရန် ဖြစ်သည်။
        </p>

        {/* Accountability Rule items */}
        <div className="space-y-3.5 pt-2">
          {/* Rule 1 */}
          <label className="flex items-start gap-3 cursor-pointer group select-none">
            <input 
              type="checkbox" 
              checked={agreedEdge} 
              onChange={() => setAgreedEdge(!agreedEdge)}
              className="mt-1 accent-amber-500 w-4 h-4 rounded border-zinc-700 bg-zinc-800 cursor-pointer"
            />
            <span className="text-xs text-zinc-300 leading-normal group-hover:text-zinc-200 transition-colors">
              <strong>ယနေ့ရဲ့ တာဝန် (Today's Mission):</strong> ငွေရှာဖို့ မဟုတ်၊ AM Session Edge ကို စည်းကမ်းတကျ Execute လုပ်ဖို့ ဖြစ်သည်။ Outcome ကို လက်ခံသည်။
            </span>
          </label>

          {/* Rule 2 */}
          <label className="flex items-start gap-3 cursor-pointer group select-none">
            <input 
              type="checkbox" 
              checked={agreedHours} 
              onChange={() => setAgreedHours(!agreedHours)}
              className="mt-1 accent-amber-500 w-4 h-4 rounded border-zinc-700 bg-zinc-800 cursor-pointer"
            />
            <span className="text-xs text-zinc-300 leading-normal group-hover:text-zinc-200 transition-colors">
              <strong>Allowed Trading Windows:</strong> 9:30 AM - 11:30 AM ကြားသာ Trade မည်။ 10:00-10:30 AM Window ကို အထူးဦးစားပေးပြီး Setup မရှိလျှင် မကုန်မချင်း စိတ်ရှည်စွာ စောင့်ဆိုင်းမည်။
            </span>
          </label>

          {/* Rule 3 */}
          <label className="flex items-start gap-3 cursor-pointer group select-none">
            <input 
              type="checkbox" 
              checked={agreedOutcome} 
              onChange={() => setAgreedOutcome(!agreedOutcome)}
              className="mt-1 accent-amber-500 w-4 h-4 rounded border-zinc-700 bg-zinc-800 cursor-pointer"
            />
            <span className="text-xs text-zinc-300 leading-normal group-hover:text-zinc-200 transition-colors">
              <strong>Outcome Acceptance (ရလဒ်လက်ခံခြင်း):</strong> Trade ဝင်ပြီးလျှင် TP, BE, SL အားလုံးကို အပြည့်အဝ လက်ခံမည်။ Trade Result ကို မပြင်နိုင်၊ ဆုံးဖြတ်ချက် အရည်အသွေး (Decision Quality) ကိုသာ ထိန်းနိုင်သည်ဟု ယုံကြည်သည်။
            </span>
          </label>

          {/* Rule 4 */}
          <label className="flex items-start gap-3 cursor-pointer group select-none">
            <input 
              type="checkbox" 
              checked={agreedLoss} 
              onChange={() => setAgreedLoss(!agreedLoss)}
              className="mt-1 accent-amber-500 w-4 h-4 rounded border-zinc-700 bg-zinc-800 cursor-pointer"
            />
            <span className="text-xs text-zinc-300 leading-normal group-hover:text-zinc-200 transition-colors">
              <strong>Max Daily Loss Plan:</strong> Total Daily Loss အနေဖြင့် Closed PnL $500 ထက်ပိုပြီး အရှုံးမခံပါ။ -$500 သို့မဟုတ် ၎င်းထက်ပိုလျှင် ယနေ့ Trading အား ချက်ချင်း ရပ်တန့်မည်ဖြစ်ပြီး Recover လုပ်ရန် လုံးဝ မကြိုးစားပါ။
            </span>
          </label>

          {/* Rule 5 */}
          <label className="flex items-start gap-3 cursor-pointer group select-none">
            <input 
              type="checkbox" 
              checked={agreedShutdown} 
              onChange={() => setAgreedShutdown(!agreedShutdown)}
              className="mt-1 accent-amber-500 w-4 h-4 rounded border-zinc-700 bg-zinc-800 cursor-pointer"
            />
            <span className="text-xs text-zinc-300 leading-normal group-hover:text-zinc-200 transition-colors">
              <strong>Strict 11:30 AM Shutdown Protocol:</strong> 11:25 AM တွင် Alarm ပေး၍ 11:30 AM တွင် TradingView & Broker ကို ပိတ်ပြီး 11:35 AM တွင် Desk မှ ထမည်။ 11:40 AM တွင် မျက်နှာပြင်မှ လုံးဝ ဝေးရာသို့ ထွက်ပြီး Desktop ပတ်ဝန်းကျင်မှ ထွက်ခွာမည်။
            </span>
          </label>
        </div>
      </div>

      <form onSubmit={handleSigning} className="space-y-4">
        {/* Signature Input */}
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-2 font-sans">
            စာချုပ်ကို လက်ခံကြောင်း လက်မှတ်ရေးထိုးပါ (Type "I COMPLY" or your initials to sign):
          </label>
          <input 
            type="text" 
            placeholder="ဥပမာ။ I COMPLY" 
            value={signature} 
            onChange={(e) => setSignature(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded px-3.5 py-2.5 text-sm text-zinc-100 font-mono placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/60"
            required
          />
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 p-3 rounded-lg border border-red-900/30 bg-red-950/20 text-xs text-red-400">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <button 
          type="submit" 
          disabled={!allAgreed || !signature}
          className={`w-full py-3.5 rounded-lg font-bold text-xs tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 ${
            allAgreed && signature
              ? "bg-amber-500 text-black hover:bg-amber-400 active:scale-95 cursor-pointer shadow-lg shadow-amber-500/20"
              : "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/20"
          }`}
        >
          <Landmark className="w-4 h-4" />
          START SESSION & COMMENCE CONTRACT Execution
        </button>
      </form>
    </div>
  );
}
