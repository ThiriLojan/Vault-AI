import axios from "axios";

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get("symbol");

    if (!symbol) {
        return new Response(JSON.stringify({ error: "Stock symbol is required" }), {
            status: 400,
        });
    }

    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    const apiUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${apiKey}`;

    try {
        const response = await axios.get(apiUrl);

        if (response.status === 429) {
            return new Response(
                JSON.stringify({ error: "⚠️ API limit reached. Please try again later." }),
                { status: 429 }
            );
        }

        const timeSeries = response.data["Time Series (Daily)"];
        if (!timeSeries) {
            return new Response(
                JSON.stringify({ error: "Invalid data or API limit reached." }),
                { status: 429 }
            );
        }

        const trendData = Object.entries(timeSeries).map(([date, data]) => ({
            date,
            price: parseFloat(data["4. close"]),
        }));

        return new Response(JSON.stringify(trendData), { status: 200 });
    } catch (error) {
        return new Response(
            JSON.stringify({ error: "Failed to fetch stock data." }),
            { status: 500 }
        );
    }
}
