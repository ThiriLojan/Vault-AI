"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ArrowUpRight, ArrowDownRight, Bot, TrendingUp, Target, Calculator, ShieldAlert, X } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface StockData {
  id: number;
  name: string;
  investedAmount: number;
  currentValue: number;
}

export default function Dashboard() {
  const { data: session } = useSession();
  const [portfolio, setPortfolio] = useState<StockData[]>([]);
  const [totalInvestment, setTotalInvestment] = useState(0);
  const [currentValue, setCurrentValue] = useState(0);
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [aiMode, setAiMode] = useState("Balanced Portfolio Engine");
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  useEffect(() => {
    if (session) {
      const u = session.user?.name || (session.user as any)?.username || session.user?.email || "guest_demo";
      const ack = localStorage.getItem(`vault_disclaimer_ack_${u}`);
      if (!ack) {
        setShowDisclaimer(true);
      }
    }
  }, [session]);

  const handleDismissDisclaimer = () => {
    const u = session?.user?.name || (session?.user as any)?.username || session?.user?.email || "guest_demo";
    localStorage.setItem(`vault_disclaimer_ack_${u}`, "true");
    setShowDisclaimer(false);
  };

  // Real-Time Interactive Trajectory State
  const [timeSpan, setTimeSpan] = useState<'1M' | '6M' | '12M' | 'ALL'>('ALL');
  const [liveJitter, setLiveJitter] = useState(0);

  useEffect(() => {
    const liveTick = setInterval(() => {
      setLiveJitter(prev => prev + (Math.floor(Math.random() * 46) - 20));
    }, 1800);
    return () => clearInterval(liveTick);
  }, []);

  const getFilteredCurve = () => {
    const u = session?.user?.name || (session?.user as any)?.username || "demo";
    if (portfolio.length === 0 && u !== "demo") {
      return [
        { label: 'Account Opened', val: 0 },
        { label: 'Today (Live)', val: 0 }
      ];
    }
    const liveVal = 26500 + liveJitter;
    if (timeSpan === '1M') {
      return [
        { label: '01 Jun', val: 24100 },
        { label: '05 Jun', val: 24450 },
        { label: '09 Jun', val: 24320 },
        { label: '13 Jun', val: 24890 },
        { label: '17 Jun', val: 25340 },
        { label: '21 Jun', val: 25910 },
        { label: 'Today (Live)', val: liveVal }
      ];
    }
    if (timeSpan === '6M') {
      return [
        { label: '15 Feb', val: 18100 },
        { label: '15 Mar', val: 17650 },
        { label: '15 Apr', val: 21200 },
        { label: '15 May', val: 22800 },
        { label: '15 Jun', val: 24600 },
        { label: 'Jul (Live)', val: liveVal }
      ];
    }
    return [
      { label: 'Jan', val: 15000 },
      { label: 'Feb', val: 18000 },
      { label: 'Mar', val: 17500 },
      { label: 'Apr', val: 21000 },
      { label: 'May', val: 22500 },
      { label: 'Jun', val: 24000 },
      { label: 'Jul (Live)', val: liveVal }
    ];
  };

  const [feedUpdates, setFeedUpdates] = useState<any[]>([
    { type: "Market", text: "NSE Nifty 50 and banking leaders saw strong institutional accumulation.", color: "#00d4aa", time: "Live Sync" },
    { type: "AI Alert", text: "Your asset rebalancing strategy is optimized for current GDP growth.", color: "#3b82f6", time: "AI Engine" },
    { type: "Goal Target", text: "Wealth compounding projections indicate milestone reached 3 weeks early.", color: "#a855f7", time: "On Track" }
  ]);

  useEffect(() => {
    const u = session?.user?.name || (session?.user as any)?.username || "demo";
    if (portfolio.length === 0 && u !== "demo") {
      setFeedUpdates([
        { type: "Welcome", text: "Your personal financial vault is ready. Add your first stock holding.", color: "#00d4aa", time: "System Ready" },
        { type: "AI Advisor", text: "AI quant allocation algorithms are waiting for portfolio ingestion.", color: "#3b82f6", time: "Standby" },
        { type: "Goal Target", text: "Set your financial milestones in the Goals tab to track compounding.", color: "#a855f7", time: "Action Required" }
      ]);
      return;
    }
    const loadFeed = async () => {
      try {
        const res = await fetch(`/api/dashboard-feed?mode=${encodeURIComponent(aiMode)}&currency=${currency}`);
        const data = await res.json();
        if (data && data.updates) setFeedUpdates(data.updates);
      } catch (err) { }
    };
    loadFeed();
    const timer = setInterval(loadFeed, 12000);
    return () => clearInterval(timer);
  }, [aiMode, currency]);

  useEffect(() => {
    const loadPrefs = () => {
      const savedCurr = localStorage.getItem('vault_currency') as 'INR' | 'USD';
      const savedMode = localStorage.getItem('vault_ai_mode');
      if (savedCurr) setCurrency(savedCurr);
      if (savedMode) setAiMode(savedMode);
    };
    loadPrefs();
    window.addEventListener('vaultPreferencesChanged', loadPrefs);
    return () => window.removeEventListener('vaultPreferencesChanged', loadPrefs);
  }, []);

  const formatMoney = (amount: number) => {
    if (currency === 'USD') {
      const usdAmount = amount / 83.5;
      return `$${usdAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  useEffect(() => {
    const u = session?.user?.name || (session?.user as any)?.username || session?.user?.email || "demo";
    fetch(`/api/db/holdings?userId=${u}&t=${Date.now()}`, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.holdings) {
          if (data.holdings.length > 0) {
            const mapped = data.holdings.map((h: any, idx: number) => ({
              id: idx + 1,
              name: h.symbol,
              investedAmount: h.investedAmount || (h.buyPrice * h.shares),
              currentValue: (h.investedAmount || (h.buyPrice * h.shares)) * 1.18
            }));
            setPortfolio(mapped);
          } else if (u === "demo" || u === "demo@vaultai.io" || u === "guest") {
            setPortfolio([
              { id: 1, name: "AAPL", investedAmount: 10000, currentValue: 12500 },
              { id: 2, name: "MSFT", investedAmount: 15000, currentValue: 14000 },
            ]);
          } else {
            setPortfolio([]);
          }
        }
      })
      .catch(() => {
        if (u === "demo") {
          setPortfolio([
            { id: 1, name: "AAPL", investedAmount: 10000, currentValue: 12500 },
            { id: 2, name: "MSFT", investedAmount: 15000, currentValue: 14000 },
          ]);
        } else {
          setPortfolio([]);
        }
      });
  }, [session]);

  useEffect(() => {
    const totalInvested = portfolio.reduce((sum, stock) => sum + stock.investedAmount, 0);
    const totalCurrentValue = portfolio.reduce((sum, stock) => sum + stock.currentValue, 0);

    setTotalInvestment(totalInvested);
    setCurrentValue(totalCurrentValue);
  }, [portfolio]);

  const profitLoss = currentValue - totalInvestment;
  const isProfit = profitLoss >= 0;
  const percentageChange = totalInvestment > 0 ? (profitLoss / totalInvestment) * 100 : 0;

  function getBestPerformingStock() {
    if (portfolio.length === 0) return "N/A";
    const bestStock = portfolio.reduce((max, stock) =>
      stock.currentValue - stock.investedAmount > max.currentValue - max.investedAmount
        ? stock
        : max
    );
    return bestStock.name;
  }

  // Chart Data
  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        fill: true,
        label: 'Portfolio Value',
        data: [15000, 18000, 17500, 21000, 22500, 24000, 26500],
        borderColor: '#00d4aa',
        backgroundColor: 'rgba(0, 212, 170, 0.1)',
        tension: 0.4,
        pointBackgroundColor: '#00d4aa',
        pointBorderColor: 'transparent',
        pointRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(8, 11, 22, 0.9)',
        titleColor: '#eef2ff',
        bodyColor: '#eef2ff',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
      },
    },
    scales: {
      y: { display: false, min: 10000 },
      x: {
        grid: { display: false, drawBorder: false },
        ticks: { color: 'rgba(238,242,255,0.52)' },
      },
    },
    interaction: { mode: 'nearest' as const, axis: 'x' as const, intersect: false },
  };

  return (
    <>
      {showDisclaimer && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999, background: 'rgba(4,6,14,0.85)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', animation: 'fadeIn 0.3s ease-out' }}>
          <div style={{ background: 'linear-gradient(180deg, #0f172a 0%, #080b16 100%)', border: '1px solid #ef4444', borderRadius: '28px', maxWidth: '520px', width: '100%', padding: '36px', boxShadow: '0 25px 70px rgba(0,0,0,0.95), 0 0 40px rgba(239,68,68,0.25)', position: 'relative', color: '#fff' }}>
            <button
              onClick={handleDismissDisclaimer}
              style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', cursor: 'pointer', transition: 'all 0.2s' }}
              title="Close Disclaimer"
            >
              <X size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
              <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '16px', padding: '14px', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(239,68,68,0.3)' }}>
                <ShieldAlert size={30} />
              </div>
              <div>
                <h3 style={{ fontSize: '22px', fontWeight: 800, margin: 0, background: 'linear-gradient(135deg, #fff 0%, #cbd5e1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>User Liability Disclaimer</h3>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>⚠️ Speculative AI & Financial Risk</span>
              </div>
            </div>

            <p style={{ color: '#94a3b8', fontSize: '13.5px', lineHeight: '1.6', margin: '0 0 20px 0' }}>
              Welcome to <strong>Vault AI</strong>. By accessing this terminal, you acknowledge and agree to the following terms regarding quantitative simulations and telemetry:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '20px', marginBottom: '28px', fontSize: '13px', color: '#cbd5e1' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '16px' }}>🤖</span>
                <div>
                  <strong style={{ color: '#fff', display: 'block', marginBottom: '2px' }}>AI-Driven Speculation Only</strong>
                  Telemetry across Sentiment Analysis, Market Prediction, AI Advisor, and Chatbot is generated by algorithmic neural models. These are speculative opinions, not guaranteed predictions.
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '16px' }}>📉</span>
                <div>
                  <strong style={{ color: '#fff', display: 'block', marginBottom: '2px' }}>Not Principal Financial Advice</strong>
                  This software is built for showcase and educational asset tracking. Do not rely on Vault AI projections as trading signals or primary investment guidance.
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '16px' }}>🛡️</span>
                <div>
                  <strong style={{ color: '#fff', display: 'block', marginBottom: '2px' }}>Zero Developer Liability</strong>
                  All capital allocation and trading execution decisions are made strictly at your own monetary risk. The developer assumes zero responsibility for any monetary loss.
                </div>
              </div>
            </div>

            <button
              onClick={handleDismissDisclaimer}
              style={{ width: '100%', padding: '16px', borderRadius: '16px', background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)', border: 'none', color: '#04060e', fontWeight: 800, fontSize: '14px', cursor: 'pointer', boxShadow: '0 8px 25px rgba(239,68,68,0.35)', transition: 'transform 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
            >
              <ShieldAlert size={18} /> I Acknowledge & Accept Financial Risk
            </button>
          </div>
        </div>
      )}
      <div className="stats-grid">
        <div className="glass-card stat-card">
          <div className="stat-card-label">Total Investment</div>
          <div className="stat-card-val">{formatMoney(totalInvestment)}</div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-card-label">Current Value</div>
          <div className="stat-card-val">{formatMoney(currentValue)}</div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-card-label">Profit / Loss</div>
          <div className="stat-card-val">
            {isProfit ? `+${formatMoney(profitLoss)}` : `-${formatMoney(Math.abs(profitLoss))}`}
          </div>
          <div className={`stat-card-change ${isProfit ? 'change-up' : 'change-down'}`}>
            {isProfit ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(percentageChange).toFixed(2)}%
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-card-label">Best Performer</div>
          <div className="stat-card-val">{getBestPerformingStock()}</div>
          <div className="stat-card-change text-teal-400 mt-2">
            {portfolio.length === 0 ? "Awaiting first asset" : "Driving main growth"}
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRadius: '24px', overflow: 'hidden', minWidth: 0, border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ padding: '28px 28px 10px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div className="section-title text-xl" style={{ margin: 0 }}>📈 Real-Time Portfolio Trajectory</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00d4aa', boxShadow: '0 0 8px #00d4aa', display: 'inline-block', animation: 'pulse 1.5s infinite' }}></span>
                <span style={{ fontSize: '12.5px', color: '#00d4aa', fontWeight: 'bold', fontFamily: 'monospace' }}>LIVE QUANT ENGINE • {formatMoney(currentValue || ((session?.user?.name || (session?.user as any)?.username) === 'demo' ? 26500 : 0))}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '6px', background: 'rgba(255,255,255,0.04)', padding: '4px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
              {(['1M', '6M', '12M', 'ALL'] as const).map(span => (
                <button
                  key={span}
                  onClick={() => setTimeSpan(span)}
                  style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer', transition: 'all 0.2s', background: timeSpan === span ? '#00d4aa' : 'transparent', color: timeSpan === span ? '#04060e' : '#94a3b8' }}
                >
                  {span}
                </button>
              ))}
            </div>
          </div>

          <div style={{ width: '100%', height: '310px', marginTop: '10px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={getFilteredCurve()} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="dashTeal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d4aa" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#00d4aa" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" stroke="rgba(255,255,255,0.1)" tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 12 }} dy={-5} />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{ backgroundColor: "rgba(4,6,14,0.95)", border: "1px solid rgba(0,212,170,0.4)", borderRadius: "14px", color: "#fff", padding: "12px", fontSize: "13px" }}
                  itemStyle={{ color: "#00d4aa", fontWeight: "bold" }}
                  formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, 'Portfolio Value']}
                />
                <Area
                  type="monotone"
                  dataKey="val"
                  stroke="#00d4aa"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#dashTeal)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '28px', borderRadius: '24px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', minWidth: 0 }}>
          <div className="section-title text-xl mb-4">⚡ Quick Actions</div>
          <div className="quick-actions" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
            <Link href="/advisor" className="glass-card" style={{ padding: '16px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '10px', color: '#fff', fontWeight: 'bold', textDecoration: 'none', border: '1px solid rgba(0,212,170,0.2)' }}>
              <Bot size={20} color="#00d4aa" /> AI Advisor
            </Link>
            <Link href="/prediction" className="glass-card" style={{ padding: '16px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '10px', color: '#fff', fontWeight: 'bold', textDecoration: 'none', border: '1px solid rgba(59,130,246,0.2)' }}>
              <TrendingUp size={20} color="#3b82f6" /> Predict
            </Link>
            <Link href="/goal-trackers" className="glass-card" style={{ padding: '16px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '10px', color: '#fff', fontWeight: 'bold', textDecoration: 'none', border: '1px solid rgba(168,85,247,0.2)' }}>
              <Target size={20} color="#a855f7" /> Goals
            </Link>
            <Link href="/tools-calculators" className="glass-card" style={{ padding: '16px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '10px', color: '#fff', fontWeight: 'bold', textDecoration: 'none', border: '1px solid rgba(245,158,11,0.2)' }}>
              <Calculator size={20} color="#f59e0b" /> Tools
            </Link>
          </div>

          <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div className="section-title text-xl" style={{ margin: 0 }}>📰 Recent Updates</div>
              <span style={{ fontSize: '11px', fontWeight: 'bold', padding: '4px 8px', borderRadius: '6px', background: 'rgba(0,212,170,0.15)', color: '#00d4aa', letterSpacing: '0.5px' }}>
                {aiMode.includes('Aggressive') ? '🚀 AGGRESSIVE' : aiMode.includes('Conservative') ? '🛡️ CONSERVATIVE' : '⚖️ BALANCED'}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {feedUpdates.map((item: any, idx: number) => (
                <div key={idx} style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', boxSizing: 'border-box', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1, minWidth: 0 }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0, marginTop: '5px', background: item.color || '#00d4aa', boxShadow: `0 0 8px ${item.color || '#00d4aa'}` }}></span>
                    <div style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                      <span style={{ color: item.color || '#00d4aa', fontWeight: 'bold', marginRight: '6px', fontSize: '14px' }}>{item.type}:</span>
                      <span style={{ color: 'rgba(255,255,255,0.88)', fontSize: '13.5px', lineHeight: '1.5' }}>{item.text}</span>
                    </div>
                  </div>
                  {item.time && (
                    <span style={{ fontSize: '11px', color: '#94a3b8', flexShrink: 0, background: 'rgba(255,255,255,0.06)', padding: '3px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
                      {item.time}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
