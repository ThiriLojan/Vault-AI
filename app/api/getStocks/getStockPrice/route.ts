import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get("symbol");

    if (!symbol) {
        return NextResponse.json({ error: "Stock symbol is required." }, { status: 400 });
    }

    try {
        const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
        const response = await fetch(
            `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`
        );

        const data = await response.json();
        const price = data["Global Quote"]["05. price"];

        if (!price) {
            return NextResponse.json({ error: "Stock data not found." }, { status: 404 });
        }

        return NextResponse.json({ price }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch stock data." }, { status: 500 });
    }
}
