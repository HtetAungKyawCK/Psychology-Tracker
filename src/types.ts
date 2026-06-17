export interface Trade {
  id: string;
  time: string; // e.g., "10:14 AM"
  setupName: string; // e.g., "FVG Entry", "MSS", etc.
  pnl: 'TP' | 'SL' | 'BE';
  pnlAmount: number; // in R-multiple (e.g., +2R, -1R, etc.)
  acceptedOutcome: boolean; // Did they accept the outcome without emotion?
  notes: string;
}

export interface DaySession {
  date: string; // "YYYY-MM-DD"
  contractSigned: boolean;
  preMarketReady: boolean;
  trades: Trade[];
  complianceScore: number; // 0-100% based on rule execution
  shutdownCompleted: {
    alarm1125: boolean;
    closed1130: boolean;
    desk1135: boolean;
    screen1140: boolean;
  };
  hasPmSessionTrades: boolean; // CRITICAL RULE: Did they trade after 11:30 AM?
  maxLossReached: boolean; // Did they hit -1R or -2R and stopped?
  complianceStatus: 'EXCELLENT' | 'COMPLIANT' | 'FAILED'; // FAILED if hasPmSessionTrades is true
  reflections: string;
}

export interface StreakStats {
  currentStreak: number;
  highestStreak: number;
  totalDays: number;
  compliantDays: number;
}
