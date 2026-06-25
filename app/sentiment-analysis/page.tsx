"use client";

import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function SentimentAnalysisPage() {
    const [symbol, setSymbol] = useState("");
    const [sentiment, setSentiment] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!symbol.trim()) return;
        setLoading(true);
        setError("");
        setSentiment(null);

        try {
            const sym = symbol.trim().toUpperCase();
            const res = await fetch(`/api/sentiment?symbol=${sym}`);
            const data = await res.json();
            if (data && data.symbol) {
                setSentiment(data);
            } else {
                setError("Failed to parse sentiment feed.");
            }
        } catch (err) {
            setError("Failed to reach sentiment network.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full">
            <div className="section-title mb-6 text-2xl">⚡ Real-Time AI Neural Sentiment Analysis</div>
            <p className="mb-8 text-gray-400 max-w-2xl text-lg">
                Query institutional order flows, news sentiment algorithms, and macroeconomic momentum across global markets.
            </p>

            <div className="glass-card card-pad max-w-2xl" style={{ marginTop: '32px', marginBottom: '40px' }}>
                <div className="section-title text-lg mb-6">Scan Asset or Mutual Fund Ticker</div>
                <form onSubmit={handleAnalyze} className="flex flex-col gap-6">
                    <div>
                        <label className="form-label" style={{ display: 'block', marginBottom: '10px' }}>Ticker Symbol (e.g., TRENT, RELIANCE, ZOMATO, AAPL, BTC)</label>
                        <input
                            type="text"
                            value={symbol}
                            onChange={(e) => setSymbol(e.target.value)}
                            required
                            placeholder="Type stock or crypto ticker..."
                            className="form-input"
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn-primary w-full"
                        style={{ padding: '16px', fontSize: '16px', fontWeight: 'bold' }}
                        disabled={loading}
                    >
                        {loading ? "🤖 Scanning News & Institutional Order Book..." : "Run Neural Sentiment Scan"}
                    </button>
                </form>
            </div>

            {loading && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px', gap: '20px' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', border: '4px solid rgba(0,212,170,0.15)', borderTopColor: '#00d4aa', animation: 'spin 1s linear infinite' }}></div>
                    <p style={{ color: '#00d4aa', fontWeight: 'bold', fontSize: '18px', animation: 'pulse 1.5s infinite' }}>Synthesizing Global Headlines...</p>
                </div>
            )}

            {sentiment && !loading && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    {/* Top Sentiment Scorecard */}
                    <div className="glass-card card-pad flex flex-wrap justify-between items-center gap-6 border-l-4 border-l-[#3b82f6]">
                        <div>
                            <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.08)', padding: '4px 10px', borderRadius: '6px', color: '#cbd5e1', fontWeight: 'bold' }}>NEURAL SENTIMENT FEED</span>
                            <h2 style={{ color: '#fff', fontSize: '36px', fontWeight: 'bold', margin: '8px 0 6px 0', fontFamily: "'Syne', sans-serif" }}>{sentiment.symbol}</h2>
                            <p style={{ color: '#94a3b8', margin: 0, fontSize: '15px', maxWidth: '600px', lineHeight: '1.6' }}>{sentiment.summary}</p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
                            <div style={{ background: sentiment.score >= 0.65 ? 'rgba(0,212,170,0.2)' : sentiment.score <= 0.4 ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)', color: sentiment.score >= 0.65 ? '#00d4aa' : sentiment.score <= 0.4 ? '#f87171' : '#fbbf24', padding: '10px 20px', borderRadius: '12px', fontWeight: 'bold', fontSize: '22px' }}>
                                {sentiment.sentiment}
                            </div>
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                <span style={{ color: '#64748b', fontSize: '13px' }}>Neural Confidence:</span>
                                <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '16px', background: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: '6px' }}>{sentiment.confidence}</span>
                            </div>
                        </div>
                    </div>

                    {/* Recharts 10-Day Sentiment Progression */}
                    <div className="glass-card card-pad">
                        <div className="section-title text-xl mb-8">📈 10-Day Institutional Sentiment Velocity (0.0 to 1.0)</div>
                        <ResponsiveContainer width="100%" height={340}>
                            <LineChart data={sentiment.trend.map((val: any, idx: number) => ({ day: `Day ${idx+1}`, score: val }))}>
                                <Line
                                    type="monotone"
                                    dataKey="score"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    dot={{ fill: '#04060e', strokeWidth: 2, r: 5, stroke: '#3b82f6' }}
                                    activeDot={{ r: 8, strokeWidth: 0, fill: '#fff' }}
                                />
                                <XAxis dataKey="day" stroke="rgba(255,255,255,0.1)" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }} dy={10} />
                                <YAxis domain={[0, 1]} stroke="rgba(255,255,255,0.1)" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }} dx={-10} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: "rgba(4,6,14,0.95)", border: "1px solid rgba(59,130,246,0.4)", borderRadius: "16px", color: "#fff", padding: "14px" }}
                                    itemStyle={{ color: "#3b82f6", fontWeight: "bold" }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Live Catalyst Headlines Grid */}
                    <div>
                        <div className="section-title text-xl mb-6">📰 Key Institutional Catalysts & News</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                            {sentiment.news.map((headline: string, i: number) => (
                                <div key={i} className="glass-card flex items-start gap-4 transition-colors" style={{ padding: '24px', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                    <span style={{ fontSize: '24px' }}>💬</span>
                                    <p style={{ color: '#e2e8f0', fontSize: '15px', lineHeight: '1.6', margin: 0, fontWeight: '500' }}>{headline}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}