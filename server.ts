import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK lazily to avoid crashing on start if API key is missing
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is missing in secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// ----------------------
// API ROUTES
// ----------------------

// Health check
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// AI Coach endpoint
app.post("/api/coach", async (req: Request, res: Response) => {
  try {
    const { message, context, type } = req.body;
    
    let systemInstruction = `
You are an elite Hedge Fund Risk Manager and Trading Psychology Coach.
Your tone is professional, tough, yet compassionate. You deeply understand human traders, overtrading, and the toxic loop of:
"Loss -> Denial/Non-acceptance -> Emotional PM Revenge Trading -> Broke Account".

The trader has committed to a strict Professional Trading Contract:
- Allowed window: 9:30 AM - 11:30 AM (US Eastern time).
- Preferred trading window: 10:00 AM - 10:30 AM.
- Outcomes fully accepted: TP (Take Profit), BE (Break Even), SL (Stop Loss). Trade results are unchangeable; only decision quality can be controlled.
- Mandatory Shutdown Protocol starts at 11:25 AM. Trading environment closed at 11:30 AM, away from desk by 11:35 AM, screen-free by 11:40 AM.
- Daily Max Loss Limit: -1R or -2R. If hit, STOP immediately and accept it. No PM recovery attempts.

Respond primarily in Myanmar (Burmese) language since the user values it, using professional English terms where helpful (e.g., Setup, Risk multiple, Fund mandate, Equity curve, Trading contract, Emotion, Acceptance).
Speak directly with deep authority like a mentor or hedge fund allocator.
Keep your response concise (under 250 words), impactful, and extremely actionable.
`;

    if (type === "temptation") {
      systemInstruction += `
Specific Situation: The user's brain is currently tempting them to enter a trade outside the allowed hours or after reaching their loss limit. 
Provide a powerful psychological shield. Remind them of the "Emergency Rule": "Maybe. But it is outside my fund mandate."
Congratulate them for clicking the emergency button instead of the trade button. This action itself is a MASSIVE success.
Tell them in Myanmar to physically stand up, step away from the desk, and lock in this victory of discipline.
`;
    } else if (type === "review") {
      systemInstruction += `
Specific Situation: The user is reviewing their trade results for the day.
Analyze the provided day data (compliance score, trades, whether they stopped after 11:30) and give a rigorous risk performance assessment.
Remember: Success is NOT about profits earned. Success is defined by: "Did you enter any trade after 11:30 AM?" and "Were you compliant with your limits?".
Rate their session as a true Hedge Fund Manager and tell them how this builds their 100-trade equity curve.
`;
    } else {
      systemInstruction += `
General Situation: The user wants to consult you regarding their trading psychology, fears, greed, or struggles. 
Provide structured, highly disciplined risk management counseling in Myanmar.
`;
    }

    const client = getGeminiClient();
    const prompt = `
Context details:
${JSON.stringify(context || {})}

User current state/input:
"${message}"
`;

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ reply: response.text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: error.message || "Failed to communicate with AI Coach" });
  }
});

// ----------------------
// VITE AND STATIC SERVING
// ----------------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
