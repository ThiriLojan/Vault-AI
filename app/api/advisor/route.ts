import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { amount, risk, goal, currency = "INR", market = "auto" } = await req.json();
    const amt = Number(amount) || (currency === 'USD' ? 500 : 50000);
    const sym = currency === 'USD' ? '$' : '₹';

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY.includes("your_api")) {
      return NextResponse.json({ fallback: true });
    }

    let mktTarget = currency === 'USD' 
      ? '**US Wall Street Bluechips (AAPL, NVDA, MSFT, TSLA) & S&P 500 / NASDAQ ETFs**' 
      : '**Top Indian Mutual Funds (SIPs / Flexicap / Smallcap Funds) & Indian NSE Stocks (.NS)**';

    if (market === "india") {
      mktTarget = '**Indian BSE / NSE Stocks (.NS/.BO) & Elite Domestic Indian Mutual Funds (SIPs)**';
    } else if (market === "us") {
      mktTarget = '**US Wall Street Tech Giants (NYSE / NASDAQ) & S&P 500 Core ETFs**';
    } else if (market === "crypto") {
      mktTarget = '**Top Layer-1 Cryptocurrencies (BTC, ETH, SOL) & High-Beta Web3 AI Tokens**';
    } else if (market === "global") {
      mktTarget = '**Global Multi-Asset Blend across US Tech, Indian Bluechips, Gold ETFs, and Bitcoin**';
    }

    const prompt = `You are Vault AI, an elite institutional portfolio manager and wealth management strategist. 
A user wants to invest ${sym}${amt} ${currency} with a "${risk}" risk profile targeting the financial goal: "${goal || 'General Wealth Creation & Inflation Beating'}".
Target Market Preference: "${market.toUpperCase()}".
Select 3 distinct asset allocation buckets explicitly recommending a rich blend of ${mktTarget} tailored for this exact goal and market preference.

Return ONLY a valid JSON string (no markdown fencing, no explanation outside JSON) with this exact schema:
{
  "title": "Strategy Title with emoji",
  "badge": "RISK • STRATEGY FOCUS",
  "expectedReturn": "X% - Y% p.a.",
  "summary": "Concise 1-sentence strategic rationale tailored for ${sym}${amt} ${currency} in ${market.toUpperCase()} markets.",
  "allocations": [
    {
      "category": "Sector / Asset Bucket Name",
      "tickers": "TICKER1 / TICKER2",
      "percentage": 50,
      "amount": ${amt * 0.5},
      "color": "#00d4aa",
      "rationale": "Brief macroeconomic reason why these specific assets are chosen right now."
    },
    {
      "category": "Second Asset Bucket",
      "tickers": "TICKER3 / TICKER4",
      "percentage": 30,
      "amount": ${amt * 0.3},
      "color": "#3b82f6",
      "rationale": "Rationale for second group."
    },
    {
      "category": "Third Asset Bucket",
      "tickers": "TICKER5 / TICKER6",
      "percentage": 20,
      "amount": ${amt * 0.2},
      "color": "#8b5cf6",
      "rationale": "Rationale for third group."
    }
  ]
}
Ensure percentages sum precisely to 100 and exact amounts match the percentages of ${sym}${amt}. Pick active, compelling tickers.`;

    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      prompt,
    });

    const cleanedText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const data = JSON.parse(cleanedText);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("AI Advisor Generation Error:", error);
    return NextResponse.json({ fallback: true });
  }
}
