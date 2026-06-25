import { google } from '@ai-sdk/google';
import { streamText, tool, convertToModelMessages, type UIMessage } from 'ai';
import { z } from 'zod';
import YahooFinance from 'yahoo-finance2';
const yahooFinance = new YahooFinance();

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    const rawMessages: any[] = (await req.json()).messages || [];
    const normalizedMessages = rawMessages.map((m: any) => ({
      ...m,
      parts: m.parts || [{ type: 'text', text: m.content || '' }]
    }));

    const result = streamText({
      model: google('gemini-2.5-flash'),
      maxSteps: 5,
      system: `You are Vault AI, an elite, highly sophisticated AI financial advisor and real-time stock market analyst.
You have access to real-time stock market quotes and financial statistics via the getStockPrice tool.
When a user asks about any stock or cryptocurrency (e.g. AAPL, TSLA, NVDA, BTC-USD), ALWAYS call the getStockPrice tool to fetch live data before answering. Never guess or hallucinate stock prices.
Format numbers cleanly with currency symbols (e.g. $185.20) and percentages (+2.4%). Keep insights sharp, professional, and well-structured in Markdown.`,
      messages: await convertToModelMessages(normalizedMessages),
    tools: {
      getStockPrice: {
        description: 'Get real-time stock quotes, price changes, market cap, and volume for a given ticker symbol (e.g. AAPL, TSLA, MSFT, BTC-USD)',
        inputSchema: z.object({
          symbol: z.string().describe('The stock ticker symbol (e.g. AAPL, TSLA, BTC-USD)'),
        }),
        execute: async ({ symbol }: { symbol: string }) => {
          try {
            // First search Yahoo Finance to auto-resolve international or vague tickers (e.g. TCS -> TCS.NS)
            let targetSymbol = symbol.toUpperCase();
            if (!targetSymbol.includes('.') && !targetSymbol.includes('-')) {
              const searchRes = await yahooFinance.search(symbol);
              const firstMatch = searchRes.quotes.find((q: any) => q.isYahooFinance);
              if (firstMatch?.symbol) {
                targetSymbol = firstMatch.symbol;
              }
            }

            const quote = await yahooFinance.quote(targetSymbol);
            return {
              resolvedSymbol: quote.symbol,
              shortName: quote.shortName || quote.longName,
              price: quote.regularMarketPrice,
              change: quote.regularMarketChange,
              changePercent: quote.regularMarketChangePercent,
              high: quote.regularMarketDayHigh,
              low: quote.regularMarketDayLow,
              volume: quote.regularMarketVolume,
              marketCap: quote.marketCap,
              currency: quote.currency,
            };
          } catch (error: any) {
            return { error: `Unable to fetch live market quote for "${symbol}": ${error.message}` };
          }
        },
      },
    },
  });

  return result.toUIMessageStreamResponse({
    onError: (err) => {
      console.error("GEMINI STREAM ERROR:", err);
      return err instanceof Error ? err.message : JSON.stringify(err);
    },
  });
}
