import axios from "axios";
import { NextResponse } from "next/server";

export async function GET() {
    console.log("Server-side API Key:", process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY);
    const API_KEY = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY; // Use 'NEXT_PUBLIC_' prefix for client-side access
    const url = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=USD&to_currency=INR&apikey=${API_KEY}`;

    try {
        const response = await axios.get(url);
        const exchangeRate = parseFloat(
            response.data["Realtime Currency Exchange Rate"]["5. Exchange Rate"]
        );

        if (!exchangeRate) throw new Error("Invalid exchange rate data");

        return NextResponse.json({ exchangeRate });
    } catch (error: any) {
        console.error("Error fetching USD to INR rate:", error.message || error);
        return NextResponse.json({ exchangeRate: 83 }); // Fallback value if API fails
    }
}
