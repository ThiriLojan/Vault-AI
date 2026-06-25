import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Holding from "@/models/Holding";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || "demo";

    const isDemo = userId === 'demo' || userId === 'demo@vaultai.io' || userId === 'guest' || userId === 'guest_demo';

    if (isDemo) {
      const showcaseHoldings = [
        { _id: "showcase_1", userId, symbol: "NVDA", name: "NVIDIA Corp", investedAmount: 120000, shares: 10, buyPrice: 12000, createdAt: new Date().toISOString() },
        { _id: "showcase_2", userId, symbol: "RELIANCE.NS", name: "Reliance Industries", investedAmount: 145000, shares: 50, buyPrice: 2900, createdAt: new Date().toISOString() },
        { _id: "showcase_3", userId, symbol: "AAPL", name: "Apple Inc", investedAmount: 150000, shares: 10, buyPrice: 15000, createdAt: new Date().toISOString() },
        { _id: "showcase_4", userId, symbol: "HDFCBANK.NS", name: "HDFC Bank Ltd", investedAmount: 80000, shares: 50, buyPrice: 1600, createdAt: new Date().toISOString() },
        { _id: "showcase_5", userId, symbol: "TSLA", name: "Tesla Inc", investedAmount: 100000, shares: 5, buyPrice: 20000, createdAt: new Date().toISOString() },
        { _id: "showcase_6", userId, symbol: "TATAMOTORS.NS", name: "Tata Motors", investedAmount: 95000, shares: 100, buyPrice: 950, createdAt: new Date().toISOString() }
      ];
      return NextResponse.json({ success: true, holdings: showcaseHoldings });
    }

    await connectToDatabase();

    // Clean up mock demo stocks accidentally inserted into Thiri Lojan's real account
    if (userId === 'Thiri Lojan' || userId === 'thirilojan.hl@gmail.com' || userId === 'Vault AI Showcase') {
      await Holding.deleteMany({
        $or: [
          { userId: 'Thiri Lojan' },
          { userId: 'thirilojan.hl@gmail.com' },
          { userId: 'Vault AI Showcase' }
        ],
        symbol: { $in: ['NVDA', 'RELIANCE.NS', 'AAPL', 'HDFCBANK.NS', 'TSLA', 'TATAMOTORS.NS'] }
      });
    }

    const holdings = await Holding.find({ userId }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, holdings });
  } catch (error: any) {
    console.error("Database GET Holdings Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { symbol, name, investedAmount, shares, buyPrice, userId } = body;

    if (!symbol || !investedAmount) {
      return NextResponse.json({ success: false, error: "Symbol and invested amount required" }, { status: 400 });
    }

    const isDemo = userId === 'demo' || userId === 'demo@vaultai.io' || userId === 'guest' || userId === 'guest_demo';
    if (isDemo) {
      return NextResponse.json({ success: true, mocked: true });
    }

    await connectToDatabase();
    const newHolding = await Holding.create({
      userId: userId || "demo",
      symbol: symbol.toUpperCase(),
      name: name || symbol.toUpperCase(),
      investedAmount: Number(investedAmount),
      shares: Number(shares || 1),
      buyPrice: Number(buyPrice || investedAmount),
    });

    return NextResponse.json({ success: true, holding: newHolding });
  } catch (error: any) {
    console.error("Database POST Holding Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "ID required" }, { status: 400 });
    }

    if (id.startsWith("showcase_") || id.startsWith("demo_")) {
      return NextResponse.json({ success: true, message: "Showcase holding mocked delete" });
    }

    await connectToDatabase();
    await Holding.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Holding deleted" });
  } catch (error: any) {
    console.error("Database DELETE Holding Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
