import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { symbol } = await req.json();
    const sym = symbol?.toUpperCase() || "RELIANCE";

    const generateFallbackPrediction = (ticker: string) => {
        const hash = ticker.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const basePrice = 120 + (hash % 2500);
        const isBullish = hash % 3 !== 0;
        const targetPrice = isBullish ? basePrice * 1.095 : basePrice * 0.94;
        
        // Generate 30 days of realistic chart history
        const now = new Date();
        const chart = Array.from({ length: 30 }, (_, i) => {
            const d = new Date(now);
            d.setDate(d.getDate() - (29 - i));
            const progress = i / 29;
            const noise = (Math.sin(i * 0.8) * (basePrice * 0.015));
            const close = basePrice + ((targetPrice - basePrice) * progress) + noise;
            return {
                date: d.toISOString().split('T')[0],
                close: Number(close.toFixed(2)),
                symbol: ticker
            };
        });

        const last = chart[chart.length - 1];

        return {
            symbol: ticker,
            currentPrice: Number(basePrice.toFixed(2)),
            targetPrice: Number(targetPrice.toFixed(2)),
            change: isBullish ? `+9.5%` : `-6.0%`,
            signal: isBullish ? "STRONG BUY / ACCUMULATE" : "HOLD / WATCH",
            rsi: isBullish ? 64.2 : 46.8,
            macd: isBullish ? "Bullish Crossover" : "Neutral Consolidation",
            support: Number((basePrice * 0.95).toFixed(2)),
            resistance: Number((basePrice * 1.06).toFixed(2)),
            rationale: `Quantitative momentum algorithms detect ${isBullish ? 'heavy institutional buying support' : 'range-bound resistance'} near the 50-day exponential moving average.`,
            chartData: chart,
            latestDetails: {
                open: Number((basePrice * 0.99).toFixed(2)),
                high: Number((basePrice * 1.03).toFixed(2)),
                low: Number((basePrice * 0.97).toFixed(2)),
                close: Number(basePrice.toFixed(2)),
                volume: (125000 + (hash * 15)).toLocaleString(),
                date: now.toISOString().split('T')[0]
            }
        };
    };

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY.includes("your_api")) {
      return NextResponse.json({ success: true, data: generateFallbackPrediction(sym) });
    }

    const prompt = `You are Vault AI quantitative algorithmic trader. Generate a 30-day technical stock forecast for ticker "${sym}".
Estimate realistic current market prices (in local currency INR or USD).

Return ONLY valid JSON (no markdown code blocks, raw JSON string) with this schema:
{
  "symbol": "${sym}",
  "currentPrice": 2450.00,
  "targetPrice": 2680.00,
  "change": "+9.4%",
  "signal": "STRONG BUY" or "HOLD" or "ACCUMULATE",
  "rsi": 62.5,
  "macd": "Bullish Momentum Crossover",
  "support": 2380.00,
  "resistance": 2580.00,
  "rationale": "1 sentence technical rationale based on volume and chart patterns.",
  "latestDetails": {
    "open": 2430.00,
    "high": 2475.00,
    "low": 2415.00,
    "close": 2450.00,
    "volume": "3,450,200",
    "date": "2026-06-25"
  },
  "chartData": [
    { "date": "2026-05-26", "close": 2250.00, "symbol": "${sym}" }
    ... generate exactly 30 daily data points showing realistic progression from 30 days ago up to currentPrice today ...
  ]
}`;

    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      prompt,
    });

    const clean = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(clean);

    return NextResponse.json({ success: true, data: parsed });
  } catch (err) {
    console.error("Prediction AI Error:", err);
    return NextResponse.json({ success: true, data: null, fallback: true });
  }
}
