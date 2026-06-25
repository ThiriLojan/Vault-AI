"use client";
import { useState, useEffect } from "react";

interface Allocation {
  category: string;
  tickers: string;
  percentage: number;
  color: string;
  amount: number;
  rationale: string;
}

interface RecommendationPlan {
  title: string;
  badge: string;
  expectedReturn: string;
  summary: string;
  allocations: Allocation[];
}

export default function AdvisorPage() {
    const [investmentAmount, setInvestmentAmount] = useState("");
    const [riskLevel, setRiskLevel] = useState("low");
    const [marketPreference, setMarketPreference] = useState("auto");
    const [financialGoal, setFinancialGoal] = useState("");
    const [advice, setAdvice] = useState<RecommendationPlan | null>(null);
    const [generating, setGenerating] = useState(false);
    const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');

    useEffect(() => {
        const loadCurr = () => {
            const savedCurr = localStorage.getItem('vault_currency') as 'INR' | 'USD';
            if (savedCurr) setCurrency(savedCurr);
        };
        loadCurr();
        window.addEventListener('vaultPreferencesChanged', loadCurr);
        return () => window.removeEventListener('vaultPreferencesChanged', loadCurr);
    }, []);

    const sym = currency === 'USD' ? '$' : '₹';

    const formatMoney = (val: number) => {
        if (currency === 'USD') return `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        return `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const generateFallbackPlan = (amt: number, risk: string, mkt: string) => {
        const amtStr = formatMoney(amt);
        const isUS = mkt === "us" || (mkt === "auto" && currency === "USD");
        const isCrypto = mkt === "crypto";

        if (isCrypto) {
            return {
                title: "⚡ Decentralized Web3 & AI Alpha Blueprint",
                badge: `${risk.toUpperCase()} RISK • CRYPTO ECOSYSTEM`,
                expectedReturn: "35.0% - 60.0% p.a.",
                summary: `High-conviction digital asset allocation for your ${amtStr} capital targeting Layer-1 bedrock and AI protocols.`,
                allocations: [
                    { category: "Core Store of Value Bedrock", tickers: "BTC (Bitcoin) / ETH (Ethereum)", percentage: 50, amount: amt * 0.5, color: "#f59e0b", rationale: "Institutional sovereign adoption and deflationary supply dynamics." },
                    { category: "High-Beta Solana & Layer-1s", tickers: "SOL / AVAX / NEAR", percentage: 30, amount: amt * 0.3, color: "#8b5cf6", rationale: "Ultra-fast transaction throughput dominating decentralized compute." },
                    { category: "AI & Decentralized Physical Infrastructure", tickers: "RENDER / TAO / FET", percentage: 20, amount: amt * 0.2, color: "#00d4aa", rationale: "Decentralized GPU rendering and neural network protocols." }
                ]
            };
        }

        if (risk === "low") {
          return {
            title: isUS ? "🛡️ US Treasury & Dividend Shield Blueprint" : "🛡️ Conservative Capital Shield Blueprint",
            badge: "LOW RISK • YIELD FOCUS",
            expectedReturn: "8.5% - 10.5% p.a.",
            summary: `Tailored for your ${amtStr} capital to guarantee zero capital erosion while outperforming standard bank deposits.`,
            allocations: [
              { category: isUS ? "US Treasury Bills & Money Market" : "Debt & Liquid Mutual Funds", tickers: isUS ? "BIL / SGOV / VMFXX" : "SBI Magnum Debt Fund / HDFC Liquid SIP", percentage: 50, amount: amt * 0.5, color: "#3b82f6", rationale: "Backed by high-grade sovereign bonds. Zero volatility steady monthly yield." },
              { category: isUS ? "S&P 500 Core Index ETF" : "Largecap Index Mutual Fund", tickers: isUS ? "VOO / SPY ETF" : "UTI Nifty 50 Index Fund / NIFTYBEES", percentage: 30, amount: amt * 0.3, color: "#10b981", rationale: "Top bluechip giants capturing steady economic compounding." },
              { category: isUS ? "Dividend Aristocrats ETF" : "High Dividend Aristocrats", tickers: isUS ? "SCHD / NOBL" : "ITC.NS / COALINDIA.NS", percentage: 20, amount: amt * 0.2, color: "#8b5cf6", rationale: "Quarterly cash payouts providing reliable passive income stream." }
            ]
          };
        } else if (risk === "medium") {
          return {
            title: "⚖️ Balanced Alpha Growth Blueprint",
            badge: "MEDIUM RISK • HYBRID BLEND",
            expectedReturn: "14.2% - 17.0% p.a.",
            summary: `Optimized allocation for your ${amtStr} portfolio blending top-tier growth funds with market leaders.`,
            allocations: [
              { category: isUS ? "Nasdaq 100 & Tech Growth" : "Flexicap & Hybrid Mutual Funds", tickers: isUS ? "QQQM / VGT" : "Parag Parikh Flexi Cap / HDFC Balanced Advantage", percentage: 40, amount: amt * 0.4, color: "#10b981", rationale: "Elite active allocation capturing high alpha expansion." },
              { category: isUS ? "Core Mega-Cap Bluechips" : "Core Bluechip Equity Giants", tickers: isUS ? "MSFT / AAPL / GOOGL" : "HDFCBANK.NS / INFY.NS / TCS.NS", percentage: 35, amount: amt * 0.35, color: "#06b6d4", rationale: "Strongest corporate balance sheets acting as direct equity bedrock." },
              { category: "Precious Metals Macro Hedge", tickers: isUS ? "GLD / IAU Gold ETF" : "Nippon Gold Bees ETF", percentage: 25, amount: amt * 0.25, color: "#f59e0b", rationale: "Macro hedge against currency inflation and market volatility." }
            ]
          };
        } else {
          return {
            title: "🚀 Aggressive Smallcap & AI Tech Blueprint",
            badge: "HIGH RISK • EXPONENTIAL ALPHA",
            expectedReturn: "22.5% - 29.0% p.a.",
            summary: `Maximum wealth multiplier for your ${amtStr} capital targeting aggressive momentum and AI infrastructure.`,
            allocations: [
              { category: isUS ? "US Smallcap & Russell 2000" : "Smallcap & Midcap Mutual Funds", tickers: isUS ? "IWM / VB ETF" : "Quant Small Cap Fund / Nippon India Small Cap SIP", percentage: 40, amount: amt * 0.4, color: "#f97316", rationale: "High beta candidates capturing industrial manufacturing boom." },
              { category: "Global AI & Semiconductors", tickers: "NVDA / AAPL / MSFT / TSLA", percentage: 35, amount: amt * 0.35, color: "#ec4899", rationale: "Trillion-dollar AI ecosystems dominating global cloud and compute." },
              { category: isUS ? "Clean Energy & Cybersecurity" : "Clean Energy & Defense Capex", tickers: isUS ? "ICLN / CIBR ETF" : "HAL.NS / ADANIGREEN.NS", percentage: 25, amount: amt * 0.25, color: "#8b5cf6", rationale: "Direct high-conviction equity bets on infrastructure capex." }
            ]
          };
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const amt = Number(investmentAmount) || (currency === 'USD' ? 500 : 50000);
        setGenerating(true);
        setAdvice(null);

        try {
            const res = await fetch('/api/advisor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: amt, risk: riskLevel, goal: financialGoal, currency, market: marketPreference })
            });
            const json = await res.json();
            if (json.success && json.data) {
                setAdvice(json.data);
            } else {
                setAdvice(generateFallbackPlan(amt, riskLevel, marketPreference));
            }
        } catch (err) {
            setAdvice(generateFallbackPlan(amt, riskLevel, marketPreference));
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="w-full">
            <div className="section-title mb-6 text-2xl">💰 AI Investment Advisor</div>
            <p className="mb-8 text-gray-400 max-w-2xl text-lg">
                Get personalized, AI-driven investment advice based on your exact risk profile, capital, and financial goals.
            </p>

            <div className="dashboard-grid" style={{ marginTop: '48px' }}>
                {/* Advisor Form */}
                <div className="glass-card card-pad h-full flex flex-col">
                    <div className="section-title text-lg mb-6">Investment Profile</div>
                    
                    <form style={{ display: 'flex', flexDirection: 'column', gap: '32px', paddingTop: '14px', flex: 1 }} onSubmit={handleSubmit}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
                            <div>
                                <label className="form-label" style={{ display: 'block', marginBottom: '12px' }}>Investment Amount ({sym})</label>
                                <input
                                    type="number"
                                    value={investmentAmount}
                                    onChange={(e) => setInvestmentAmount(e.target.value)}
                                    required
                                    className="form-input"
                                    placeholder={currency === 'USD' ? "e.g. 500" : "e.g. 50000"}
                                />
                            </div>

                            <div>
                                <label className="form-label" style={{ display: 'block', marginBottom: '12px' }}>Risk Tolerance</label>
                                <select
                                    value={riskLevel}
                                    onChange={(e) => setRiskLevel(e.target.value)}
                                    className="form-input text-white"
                                >
                                    <option style={{ backgroundColor: '#0d1527', color: '#fff', padding: '10px' }} value="low">Low Risk (Conservative)</option>
                                    <option style={{ backgroundColor: '#0d1527', color: '#fff', padding: '10px' }} value="medium">Medium Risk (Balanced)</option>
                                    <option style={{ backgroundColor: '#0d1527', color: '#fff', padding: '10px' }} value="high">High Risk (Aggressive)</option>
                                </select>
                            </div>

                            <div>
                                <label className="form-label" style={{ display: 'block', marginBottom: '12px' }}>Target Market Preference</label>
                                <select
                                    value={marketPreference}
                                    onChange={(e) => setMarketPreference(e.target.value)}
                                    className="form-input text-white font-medium"
                                >
                                    <option style={{ backgroundColor: '#0d1527', color: '#fff', padding: '10px' }} value="auto">🌐 Auto-Match ({currency} Default)</option>
                                    <option style={{ backgroundColor: '#0d1527', color: '#fff', padding: '10px' }} value="india">🇮🇳 Indian BSE / NSE & Mutual Funds</option>
                                    <option style={{ backgroundColor: '#0d1527', color: '#fff', padding: '10px' }} value="us">🇺🇸 US Wall Street (NYSE / NASDAQ)</option>
                                    <option style={{ backgroundColor: '#0d1527', color: '#fff', padding: '10px' }} value="crypto">⚡ Global Crypto & Web3 AI Tokens</option>
                                    <option style={{ backgroundColor: '#0d1527', color: '#fff', padding: '10px' }} value="global">🌍 Multi-Asset Diversified Blend</option>
                                </select>
                            </div>

                            <div>
                                <label className="form-label" style={{ display: 'block', marginBottom: '12px' }}>Financial Goal (Optional)</label>
                                <input
                                    type="text"
                                    value={financialGoal}
                                    onChange={(e) => setFinancialGoal(e.target.value)}
                                    className="form-input"
                                    placeholder="e.g. Buy a home in 5 years, Retiring early"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={generating}
                            className="btn-primary w-full"
                            style={{ marginTop: 'auto', padding: '16px', fontSize: '16px', fontWeight: 'bold', opacity: generating ? 0.7 : 1 }}
                        >
                            {generating ? "🤖 Neural AI Analyzing Stocks..." : `Generate Strategy Blueprint`}
                        </button>
                    </form>
                </div>

                {/* Display Advice */}
                <div className="glass-card card-pad h-full flex flex-col">
                    <div className="section-title text-lg mb-6">AI Recommendation</div>
                    
                    {generating ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, minHeight: '340px', gap: '16px' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '3px solid rgba(0,212,170,0.2)', borderTopColor: '#00d4aa', animation: 'spin 1s linear infinite' }}></div>
                            <p style={{ color: '#00d4aa', fontWeight: 'bold', fontSize: '15px', animation: 'pulse 1.5s ease-in-out infinite' }}>Consulting Google Gemini Neural Networks...</p>
                        </div>
                    ) : !advice ? (
                        <div className="flex flex-col items-center justify-center flex-1 text-white/30 border-2 border-dashed border-white/10 rounded-2xl min-h-[340px]">
                            <span className="text-5xl mb-4">🧠</span>
                            <p className="text-base font-medium">Submit your profile to generate strategy blueprint.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px' }}>
                                <div>
                                    <h3 style={{ color: '#fff', fontWeight: 'bold', fontSize: '20px', marginBottom: '6px' }}>{advice.title}</h3>
                                    <span style={{ fontSize: '11px', background: 'rgba(0,212,170,0.12)', color: '#00d4aa', padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold', letterSpacing: '0.5px' }}>{advice.badge}</span>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div className="stat-card-label" style={{ marginBottom: '4px' }}>Target Alpha</div>
                                    <div style={{ color: '#00d4aa', fontWeight: 'bold', fontSize: '18px', fontFamily: "'Syne', sans-serif" }}>{advice.expectedReturn}</div>
                                </div>
                            </div>
                            
                            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
                                {advice.summary}
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '6px' }}>
                                {advice.allocations.map((alloc, idx) => (
                                    <div key={idx} style={{ padding: '16px', background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                            <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '15px' }}>{alloc.category}</span>
                                            <span style={{ color: alloc.color, fontWeight: 'bold', fontSize: '15px' }}>{formatMoney(alloc.amount)} ({alloc.percentage}%)</span>
                                        </div>
                                        <div style={{ width: '100%', background: 'rgba(0,0,0,0.4)', height: '8px', borderRadius: '4px', overflow: 'hidden', marginBottom: '12px' }}>
                                            <div style={{ width: `${alloc.percentage}%`, background: alloc.color, height: '100%', borderRadius: '4px', boxShadow: `0 0 10px ${alloc.color}` }}></div>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                                            <code style={{ background: 'rgba(0,0,0,0.6)', padding: '3px 8px', borderRadius: '6px', color: '#cbd5e1', fontSize: '12px', fontFamily: 'monospace' }}>📦 {alloc.tickers}</code>
                                            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>{alloc.rationale}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
