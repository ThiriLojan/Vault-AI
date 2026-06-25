import { NextResponse } from "next/server";

const portfolioData = [
    { symbol: "TATAMOTORS", quantity: 10, buyPrice: 400 },
    { symbol: "INFY", quantity: 5, buyPrice: 1400 },
];

export async function GET() {
    try {
        return NextResponse.json(portfolioData);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch portfolio data." }, { status: 500 });
    }
}
