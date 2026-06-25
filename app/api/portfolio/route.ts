import { NextResponse } from "next/server";

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const symbols = searchParams.get("symbols");

    if (!symbols) {
        return NextResponse.json({ error: "Stock symbols are required." }, { status: 400 });
    }

    const symbolList = symbols.split(",");

    try {
        const responses = await Promise.all(
            symbolList.map(async (symbol) => {
                const response = await fetch(
                    `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol.trim()}&apikey=${ALPHA_VANTAGE_API_KEY}`
                );
                const data = await response.json();
                return {
                    symbol,
                    price: parseFloat(data["Global Quote"]["05. price"]),
                    changePercent: parseFloat(data["Global Quote"]["10. change percent"]),
                };
            })
        );

        return NextResponse.json({ stocks: responses });
    } catch (error) {
        console.error("Error fetching stock data:", error);
        return NextResponse.json({
            error: "Failed to fetch stock data. Please try again later."
        }, { status: 500 });
    }
}
