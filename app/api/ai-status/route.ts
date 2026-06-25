import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || "";
  // Validate presence of real API key
  const isConnected = apiKey.length > 15 && !apiKey.includes("your_api");
  return NextResponse.json({ success: true, connected: isConnected });
}
