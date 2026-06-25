import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode") || "Balanced";
    const currency = searchParams.get("currency") || "INR";

    const generateFallbackFeed = (modeStr: string, curr: string) => {
        const isINR = curr === "INR";
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        let marketText = isINR ? "NSE Nifty 50 and Bank Nifty saw strong institutional SIP accumulation today." : "S&P 500 and tech megacaps closed higher amid AI infrastructure capex surge.";
        let alertText = modeStr.includes("Aggressive") ? "High beta tech & smallcap momentum indicators show breakout potential." : modeStr.includes("Conservative") ? "Sovereign G-Secs and liquid debt yields maintain 0% downside volatility risk." : "Your equity-to-debt rebalancing ratio is perfectly aligned with GDP growth.";
        let goalText = "System goal algorithms project milestone achievement 4 weeks ahead of schedule.";

        return {
            updates: [
                { type: "Market", text: marketText, time: "Live • " + now, color: "#00d4aa" },
                { type: "AI Alert", text: alertText, time: "AI Sync", color: "#60a5fa" },
                { type: "Goal Target", text: goalText, time: "On Track", color: "#c084fc" }
            ]
        };
    };

    try {
        if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY.includes("your_api")) {
            return NextResponse.json(generateFallbackFeed(mode, currency));
        }

        const prompt = `You are Vault AI institutional wealth dashboard assistant. Generate 3 real-time financial news/alert updates for a user investing in "${currency}" markets with a "${mode}" strategy.

Return ONLY valid JSON (raw JSON string, no markdown code block formatting) matching:
{
  "updates": [
    { "type": "Market", "text": "Concise 1-sentence real live market update for ${currency} (NSE or Wall Street).", "time": "Just now", "color": "#00d4aa" },
    { "type": "AI Alert", "text": "Tailored 1-sentence AI portfolio optimization tip for ${mode} mode.", "time": "3m ago", "color": "#3b82f6" },
    { "type": "Goal Target", "text": "Encouraging 1-sentence goal compounding status.", "time": "14m ago", "color": "#a855f7" }
  ]
}`;

        const { text } = await generateText({
            model: google('gemini-2.5-flash'),
            prompt,
        });

        const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);

        return NextResponse.json(parsed);
    } catch (err) {
      console.error("Dashboard Feed AI Error:", err);
      return NextResponse.json(generateFallbackFeed(mode, currency));
    }
}
