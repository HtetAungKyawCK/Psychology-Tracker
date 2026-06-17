import { useState, FormEvent } from "react";
import { List, MessageSquare, Send, Loader2, Sparkles, User, AlertCircle, Copy, HelpCircle } from "lucide-react";
import { DaySession } from "../types";

interface Message {
  role: "user" | "model";
  text: string;
}

interface AICoachPanelProps {
  currentSession: DaySession;
  history: DaySession[];
  onAddLogMessage?: (role: "user" | "model", msg: string) => void;
}

export default function AICoachPanel({ currentSession, history }: AICoachPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      text: "မင်္ဂလာပါ။ ငါက မင်းရဲ့ Hedge Fund Risk Manager & Trading Psychology Coach ဖြစ်ပါတယ်။ ယနေ့ မင်းရဲ့ တာဝန်ဖြစ်တဲ့ Edge execution၊ risk limits တွေနဲ့ 11:30 AM Shutdown စည်းကမ်းတွေအပေါ် စိုးရိမ်မှု၊ လောဘ သို့မဟုတ် စိတ်ခံစားမှုနောက် လိုက်ချင်နေတဲ့ စိတ်တွေကို ဒီမှာ တိုင်ပင်ဆွေးနွေးနိုင်ပါတယ်။ \n\nယနေ့ Session ကို သုံးသပ်အကဲဖြတ်မှု ရယူလိုရင်လည်း 'Request Session Assessment' ကို နှိပ်နိုင်ပါတယ်။",
    },
  ]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSendMessage = async (e?: FormEvent, customMsg?: string) => {
    if (e) e.preventDefault();
    const promptInput = customMsg || userInput;
    if (!promptInput.trim()) return;

    const query = promptInput;
    if (!customMsg) setUserInput("");

    // Add user message
    const updatedMessages = [...messages, { role: "user" as const, text: query }];
    setMessages(updatedMessages);
    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          context: {
            currentSession,
            history: history.slice(0, 5), // Send recent history for context
            totalPnL: currentSession.trades.reduce((sum, t) => sum + t.pnlAmount, 0),
          },
          type: customMsg ? "review" : "consultation",
        }),
      });

      const data = await res.json();
      if (data.reply) {
        setMessages((prev) => [...prev, { role: "model", text: data.reply }]);
      } else {
        setErrorMessage("Coach connection timed out. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Could not connect to the Risk Suite servers. Verify that the server is online.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssessmentRequest = () => {
    const totalPnL = currentSession.trades.reduce((sum, t) => sum + t.pnlAmount, 0);
    const mockAssessmentPrompt = `
ငါ့ရဲ့ ယနေ့ Trading Day ကို သုံးသပ်ပေးပါ။
- Trade အရေအတွက်: ${currentSession.trades.length}
- စုစုပေါင်း Closed PnL: ${totalPnL >= 0 ? "+" : ""}$${totalPnL.toFixed(2)}
- 11:30 Protcol အမှန်ခြစ်ပြီးမှု: Alarm (${currentSession.shutdownCompleted.alarm1125 ? "ပြီး" : "မပြီး"}), Table Closed (${currentSession.shutdownCompleted.closed1130 ? "ပြီး" : "မပြီး"}), Desk Risen (${currentSession.shutdownCompleted.desk1135 ? "ပြီး" : "မပြီး"}), Screen Darkened (${currentSession.shutdownCompleted.screen1140 ? "ပြီး" : "မပြီး"})
- 11:30 ပြီးနောက် Trade ဝင်ရောက်ခဲ့ခြင်းလား: ${currentSession.hasPmSessionTrades ? "ဝင်ခဲ့သည် (FAIL RULE)" : "မဝင်ခဲ့ပါ (SUCCESS RULE)"}
- Reflections: "${currentSession.reflections || "ပြန်လည်သုံးသပ်ချက် မရေးသားရသေးပါ"}"
`;
    handleSendMessage(undefined, mockAssessmentPrompt);
  };

  const suggestions = [
    "ရှုံးသွားလို့ အသည်းအသန် ပြန်လိုက်ချင်တဲ့စိတ် (Tilt) ကို ဘယ်လိုထိန်းချုပ်ရမလဲ?",
    "ငါ -$500 daily loss limit ထိသွားပြီ၊ Revenge trading မဝင်ချင်ရင် စိတ်ထဲမှာ ဘယ်လိုစဉ်းစားရမလဲ?",
    "11:30 AM နောက်ပိုင်း Setup တွေ့နေရင် စိတ်ကို ဘယ်လိုပြောရမလဲ?",
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      {/* CHAT MESSAGES WINDOW (8 cols) */}
      <div className="lg:col-span-8 flex flex-col bg-zinc-950 border border-zinc-800 rounded-xl h-[520px] shadow-2xl relative overflow-hidden">
        {/* Header bar */}
        <div className="bg-zinc-900/50 border-b border-zinc-800/80 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <div>
              <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-widest font-mono">
                RISK ALLOCATOR AI COUNSEL
              </h3>
              <p className="text-[9px] text-zinc-500 font-mono">Hedge Fund Risk Desk Psychology Pro</p>
            </div>
          </div>
          <button
            onClick={handleAssessmentRequest}
            className="bg-amber-500 text-black px-2.5 py-1 rounded text-[10px] font-bold hover:bg-amber-400 active:scale-95 transition-all cursor-pointer flex items-center gap-1 uppercase tracking-wider"
          >
            Request Day Assessment
          </button>
        </div>

        {/* Message logs */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-xs">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              {/* Avatar circle */}
              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-mono font-bold text-[10px] border shrink-0 ${
                msg.role === "user" 
                  ? "bg-indigo-950 border-indigo-500/40 text-indigo-400" 
                  : "bg-amber-950 border-amber-500/40 text-amber-500"
              }`}>
                {msg.role === "user" ? "TR" : "CO"}
              </div>

              {/* Message body */}
              <div className={`p-3.5 rounded-xl max-w-[85%] whitespace-pre-wrap leading-relaxed ${
                msg.role === "user"
                  ? "bg-indigo-950/20 border border-indigo-900/30 text-indigo-200"
                  : "bg-zinc-900 border border-zinc-800/80 text-zinc-300"
              }`}>
                {msg.text}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-full bg-amber-950 border border-amber-500/30 text-amber-500 flex items-center justify-center animate-spin">
                <Loader2 className="w-3.5 h-3.5" />
              </div>
              <div className="bg-zinc-900 border border-zinc-800/80 p-3.5 rounded-xl text-zinc-500 font-mono text-[10px] tracking-wider uppercase">
                Coach is analyzing trading logs & mindset matrix...
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-red-950/10 border border-red-900/20 rounded-lg text-red-400 text-[11px] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Input area */}
        <form onSubmit={handleSendMessage} className="p-3 bg-zinc-900/40 border-t border-zinc-800 flex gap-2">
          <input
            type="text"
            value={userInput}
            disabled={isLoading}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="တိုင်ပင်ဆွေးနွေးလိုသည်များကို ရေးသားပါ..."
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-650 focus:outline-none focus:border-indigo-500 font-sans"
          />
          <button
            type="submit"
            disabled={isLoading || !userInput.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 text-white disabled:bg-zinc-800 disabled:text-zinc-650 px-3.5 rounded text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* DISCIPLINARY PROMPTS SIDEBAR (4 cols) */}
      <div className="lg:col-span-4 space-y-4 flex flex-col justify-between">
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-1.5 text-zinc-200">
            <HelpCircle className="w-4 h-4 text-amber-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider font-mono">Suggested Consultations</h4>
          </div>

          <p className="text-[11px] text-zinc-500 leading-normal font-sans">
            လှုပ်လှုပ်ရှားရှား ဖြစ်နေတဲ့အချိန် အသုံးအများဆုံး တောင်းဆိုချက်များကို ချက်ချင်း ကလိစ်နှိပ်၍ မေးမြန်းပါ -
          </p>

          <div className="space-y-2 pt-1 font-sans text-xs">
            {suggestions.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setUserInput(item)}
                className="w-full text-left bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-300 hover:text-zinc-100 transition-colors cursor-pointer leading-normal block"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Hedge Fund Standard Card Quote */}
        <div className="bg-gradient-to-br from-indigo-950/20 to-zinc-950 border border-indigo-900/20 rounded-xl p-5 shadow-md">
          <span className="text-[9px] text-indigo-400 font-mono uppercase tracking-widest block mb-1">MANDATE CRITERIA</span>
          <p className="text-zinc-300 text-xs italic font-sans leading-relaxed text-justify">
            "NQ, ES, သို့မဟုတ် Gold ကို အနိုင်ယူရန် မလိုအပ်ပါ။ စိတ်ထဲမှ ကလိစ်နှိပ်လိုသော ဆန္ဒကို တားဆီးနိုင်ခြင်းသည်သာ 
            သင်၏ အကောင့်နှင့် အရည်အချင်းကို အဆပေါင်းများစွာ မြှင့်တင်ပေးမည့် အခွင့်အရေး ဖြစ်သည်။"
          </p>
          <span className="text-[10px] text-zinc-500 block text-right mt-2 font-mono">— Fund Allocator Risk Office</span>
        </div>
      </div>
    </div>
  );
}
