import axios from 'axios';
import { NextResponse } from "next/server";

const STOCK_SUGGESTIONS = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA", "META"];

export async function POST(req: Request) {
    try {
        const { symbol } = await req.json();

        // If no symbol provided, suggest a stock instead
        if (!symbol) {
            const randomStock = STOCK_SUGGESTIONS[Math.floor(Math.random() * STOCK_SUGGESTIONS.length)];
            return NextResponse.json({ response: `I suggest you look into ${randomStock}.` });
        }

        if (typeof symbol !== "string") {
            return NextResponse.json({ error: "Invalid stock symbol." }, { status: 400 });
        }

        const apiKey = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY;
        const response = await axios.get(
            `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${apiKey}`
        );

        const data = response.data["Time Series (Daily)"];
        if (!data) {
            return NextResponse.json({ error: "Stock data not found." }, { status: 404 });
        }

        const recentPrices = Object.entries(data).slice(0, 5);
        const priceChange = parseFloat(recentPrices[0][1]["4. close"]) - parseFloat(recentPrices[4][1]["4. close"]);

        const trendMessage = priceChange > 0
            ? `${symbol} is showing an upward trend with a gain of $${priceChange.toFixed(2)}.`
            : `${symbol} is showing a downward trend with a loss of $${Math.abs(priceChange).toFixed(2)}.`;

        return NextResponse.json({ response: trendMessage });

    } catch (error) {
        console.error("Error fetching stock data:", error);
        return NextResponse.json({ error: "Failed to fetch stock data." }, { status: 500 });
    }
}
