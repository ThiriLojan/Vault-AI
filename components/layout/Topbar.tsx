"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Bell, Search, Settings, Globe, TrendingUp, Sparkles, CheckCircle2, Trash2, User } from "lucide-react";

export default function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [activeDropdown, setActiveDropdown] = useState<'market' | 'search' | 'notifications' | 'settings' | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Preferences state
  const [aiMode, setAiMode] = useState("Balanced Portfolio Engine");
  const [baseCurrency, setBaseCurrency] = useState<'INR' | 'USD'>('INR');

  // Real-Time Global Market Status
  const [marketClock, setMarketClock] = useState({
    mainText: "Market Open",
    isOpen: true,
    nyse: true,
    lse: true,
    nse: true,
    tse: false
  });

  useEffect(() => {
    const calcMarkets = () => {
      const now = new Date();
      const day = now.getUTCDay();
      const isWknd = day === 0 || day === 6;
      const h = now.getUTCHours();
      const m = now.getUTCMinutes();
      const t = h + (m / 60);

      // Approximate UTC live exchange hours
      const nyse = !isWknd && t >= 13.5 && t < 20;
      const lse = !isWknd && t >= 8 && t < 16.5;
      const nse = !isWknd && t >= 3.75 && t < 10;
      const tse = !isWknd && t >= 0 && t < 6;

      const mainOpen = baseCurrency === 'USD' ? nyse : nse;
      setMarketClock({
        mainText: mainOpen ? (baseCurrency === 'USD' ? "US Market Open" : "NSE Market Open") : (baseCurrency === 'USD' ? "US Market Closed" : "NSE Market Closed"),
        isOpen: mainOpen,
        nyse,
        lse,
        nse,
        tse
      });
    };
    calcMarkets();
    const interval = setInterval(calcMarkets, 3000);
    return () => clearInterval(interval);
  }, [baseCurrency]);

  // Stateful notifications list so user can clear them
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Market Update", time: "Just now", color: "#00d4aa", desc: "Tech sector showed a 2.4% recovery rally today." },
    { id: 2, title: "AI Alert", time: "1h ago", color: "#60a5fa", desc: "Your overall portfolio volatility score is low." },
    { id: 3, title: "System Goal", time: "3h ago", color: "#c084fc", desc: "Emergency fund goal target 80% completed." },
  ]);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedMode = localStorage.getItem('vault_ai_mode');
    const savedCurr = localStorage.getItem('vault_currency') as 'INR' | 'USD';
    if (savedMode) setAiMode(savedMode);
    if (savedCurr) setBaseCurrency(savedCurr);

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAiModeChange = (mode: string) => {
    setAiMode(mode);
    localStorage.setItem('vault_ai_mode', mode);
    window.dispatchEvent(new Event('vaultPreferencesChanged'));
  };

  const handleCurrencyChange = (curr: 'INR' | 'USD') => {
    setBaseCurrency(curr);
    localStorage.setItem('vault_currency', curr);
    window.dispatchEvent(new Event('vaultPreferencesChanged'));
  };

  const getPageTitle = (path: string) => {
    if (path === "/" || path === "/dashboard") return "Dashboard";
    const segments = path.split("/").filter(Boolean);
    if (!segments.length) return "Overview";
    return segments[0]
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const popularAssets = [
    { symbol: "AAPL", name: "Apple Inc.", price: "$293.08", change: "+1.2%" },
    { symbol: "TSLA", name: "Tesla Motors", price: "$248.50", change: "+3.8%" },
    { symbol: "BTC-USD", name: "Bitcoin Crypto", price: "$64,210", change: "+4.5%" },
    { symbol: "TCS.NS", name: "Tata Consultancy", price: "₹3,850", change: "-0.4%" },
    { symbol: "NVDA", name: "NVIDIA Corp.", price: "$126.40", change: "+5.1%" },
  ];

  const filteredAssets = popularAssets.filter(
    a => a.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || a.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAssetSelect = (symbol: string) => {
    setActiveDropdown(null);
    router.push(`/chatbot?prompt=Analyze+live+stock+price+and+outlook+for+${symbol}`);
  };

  // Dialog box background styling: strictly matching Sidebar color scheme (rgba 8,10,20, blur 48px saturate 180%, subtle teal sheen)
  const dialogBoxStyle = {
    position: 'absolute' as const,
    right: 0,
    top: '100%',
    marginTop: '12px',
    background: 'linear-gradient(180deg, rgba(0, 212, 170, 0.08) 0%, rgba(8, 10, 20, 0.96) 25%, rgba(8, 10, 20, 0.98) 100%)',
    backdropFilter: 'blur(48px) saturate(180%)',
    WebkitBackdropFilter: 'blur(48px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.85), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
    borderRadius: '16px',
    padding: '20px',
    width: '320px',
    textAlign: 'left' as const,
    zIndex: 9999,
  };

  return (
    <header className="topbar relative z-50">
      <div className="topbar-left">
        <div>
          <div className="topbar-page-name">{getPageTitle(pathname)}</div>
          <div className="topbar-breadcrumb">Overview / {getPageTitle(pathname)}</div>
        </div>
      </div>
      
      <div className="topbar-right flex items-center gap-3" ref={dropdownRef} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        
        {/* 1. Market Status Badge + Dialog Box */}
        <div style={{ position: 'relative' }}>
          <div 
            onClick={() => setActiveDropdown(activeDropdown === 'market' ? null : 'market')}
            className="badge-live cursor-pointer select-none hover:opacity-80 transition-opacity"
            style={{ borderColor: marketClock.isOpen ? 'rgba(0,212,170,0.3)' : 'rgba(239,68,68,0.3)', background: marketClock.isOpen ? 'rgba(0,212,170,0.08)' : 'rgba(239,68,68,0.08)', color: marketClock.isOpen ? '#00d4aa' : '#f87171' }}
          >
            <div className="badge-live-dot" style={{ background: marketClock.isOpen ? '#00d4aa' : '#ef4444', boxShadow: marketClock.isOpen ? '0 0 8px #00d4aa' : 'none' }}></div>
            {marketClock.mainText}
          </div>
          
          {activeDropdown === 'market' && (
            <div style={dialogBoxStyle} className="animate-fadeIn">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: '#fff' }}>
                  <Globe size={16} color="#00d4aa" />
                  <span>Global Exchange Clock</span>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: 'rgba(0,212,170,0.15)', color: '#00d4aa', fontFamily: 'monospace' }}>UTC REALTIME</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ color: 'rgba(255,255,255,0.85)' }}>🇺🇸 New York (NYSE)</span>
                  <span style={{ color: marketClock.nyse ? '#00d4aa' : '#f43f5e', fontWeight: 700 }}>{marketClock.nyse ? "OPEN" : "CLOSED"}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ color: 'rgba(255,255,255,0.85)' }}>🇬🇧 London (LSE)</span>
                  <span style={{ color: marketClock.lse ? '#00d4aa' : '#f43f5e', fontWeight: 700 }}>{marketClock.lse ? "OPEN" : "CLOSED"}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ color: 'rgba(255,255,255,0.85)' }}>🇮🇳 Mumbai (NSE)</span>
                  <span style={{ color: marketClock.nse ? '#00d4aa' : '#f43f5e', fontWeight: 700 }}>{marketClock.nse ? "OPEN" : "CLOSED"}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ color: 'rgba(255,255,255,0.85)' }}>🇯🇵 Tokyo (TSE)</span>
                  <span style={{ color: marketClock.tse ? '#00d4aa' : '#f43f5e', fontWeight: 700 }}>{marketClock.tse ? "OPEN" : "CLOSED"}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 12px', borderRadius: '8px', background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.25)' }}>
                  <span style={{ color: '#00d4aa', fontWeight: 600 }}>⚡ Crypto & Forex</span>
                  <span style={{ color: '#00d4aa', fontWeight: 700 }}>24/7 ACTIVE</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* 2. Search Button + Dialog Box */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => { setActiveDropdown(activeDropdown === 'search' ? null : 'search'); setSearchQuery(""); }}
            className={`p-2 rounded-lg transition-colors border ${activeDropdown === 'search' ? 'bg-white/15 border-[#00d4aa] text-[#00d4aa]' : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/70'}`}
            title="Search Tickers"
          >
            <Search size={18} />
          </button>

          {activeDropdown === 'search' && (
            <div style={dialogBoxStyle} className="animate-fadeIn">
              <div style={{ position: 'relative', marginBottom: '16px' }}>
                <Search size={16} color="#00d4aa" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                <input 
                  type="text" 
                  placeholder="Search ticker (AAPL, TCS)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full text-sm text-white focus:outline-none transition-colors placeholder:text-white/40 font-sans"
                  style={{ 
                    width: '100%', 
                    background: 'rgba(0,0,0,0.45)', 
                    border: '1px solid rgba(0, 212, 170, 0.4)', 
                    borderRadius: '8px', 
                    paddingLeft: '38px', 
                    paddingRight: '12px', 
                    paddingTop: '10px', 
                    paddingBottom: '10px',
                    color: '#fff',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>Popular Assets</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '240px', overflowY: 'auto' }}>
                {filteredAssets.length > 0 ? (
                  filteredAssets.map((asset) => (
                    <div 
                      key={asset.symbol}
                      onClick={() => handleAssetSelect(asset.symbol)}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 10px', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s', border: '1px solid transparent' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
                    >
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>{asset.symbol}</div>
                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{asset.name}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '14px', fontFamily: 'monospace', color: '#fff' }}>{asset.price}</div>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: asset.change.startsWith('+') ? '#00d4aa' : '#f43f5e' }}>{asset.change}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>No matching assets found.</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 3. Notification Button + Dialog Box */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setActiveDropdown(activeDropdown === 'notifications' ? null : 'notifications')}
            className={`p-2 rounded-lg transition-colors border relative ${activeDropdown === 'notifications' ? 'bg-white/15 border-[#00d4aa] text-[#00d4aa]' : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/70'}`}
            title="Notifications"
          >
            <Bell size={18} />
            {/* New indicator dot positioned on top of the bell icon corner outside button padding */}
            {notifications.length > 0 && (
              <span style={{ position: 'absolute', top: '-3px', right: '-3px', width: '9px', height: '9px', backgroundColor: '#00d4aa', borderRadius: '50%', boxShadow: '0 0 8px #00d4aa', border: '2px solid #090e1b' }}></span>
            )}
          </button>

          {activeDropdown === 'notifications' && (
            <div style={dialogBoxStyle} className="animate-fadeIn">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: '#fff' }}>
                  <Sparkles size={16} color="#00d4aa" />
                  <span>Notifications</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: 'rgba(0,212,170,0.15)', color: '#00d4aa' }}>
                    {notifications.length} New
                  </span>
                  {notifications.length > 0 && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); setNotifications([]); }}
                      style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', padding: 0 }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#f43f5e'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
                      title="Clear all notifications"
                    >
                      <Trash2 size={12} /> Clear
                    </button>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div key={n.id} style={{ padding: '11px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <span style={{ fontWeight: 700, color: n.color }}>{n.title}</span>
                        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}>{n.time}</span>
                      </div>
                      <p style={{ color: 'rgba(255,255,255,0.85)', margin: 0, lineHeight: 1.4 }}>{n.desc}</p>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '28px 0', color: 'rgba(255,255,255,0.4)', fontSize: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={24} color="#00d4aa" />
                    <span>All caught up! No new alerts.</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 4. Settings Button + Dialog Box */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setActiveDropdown(activeDropdown === 'settings' ? null : 'settings')}
            className={`p-2 rounded-lg transition-colors border ${activeDropdown === 'settings' ? 'bg-white/15 border-[#00d4aa] text-[#00d4aa]' : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/70'}`}
            title="Settings"
          >
            <Settings size={18} />
          </button>

          {activeDropdown === 'settings' && (
            <div style={dialogBoxStyle} className="animate-fadeIn">
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '14px' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Settings size={16} color="#00d4aa"/> Preferences
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 700, marginBottom: 6, display: 'block', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.05em' }}>AI Strategy Engine</label>
                  <select 
                    value={aiMode}
                    onChange={(e) => handleAiModeChange(e.target.value)}
                    style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '9px', color: '#fff', fontSize: '12px', cursor: 'pointer' }}
                  >
                    <option value="Balanced Portfolio Engine">Balanced Portfolio Engine</option>
                    <option value="Aggressive Growth">Aggressive Growth Engine</option>
                    <option value="Conservative Yield">Conservative Yield Engine</option>
                  </select>
                </div>
                <div>
                  <label style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 700, marginBottom: 6, display: 'block', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.05em' }}>Base Display Currency</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <button 
                      onClick={() => handleCurrencyChange('INR')}
                      style={{ padding: '8px', borderRadius: '8px', background: baseCurrency === 'INR' ? 'rgba(0,212,170,0.2)' : 'rgba(255,255,255,0.05)', border: baseCurrency === 'INR' ? '1px solid #00d4aa' : '1px solid rgba(255,255,255,0.1)', color: baseCurrency === 'INR' ? '#00d4aa' : 'rgba(255,255,255,0.7)', fontWeight: 600, cursor: 'pointer' }}
                    >
                      INR (₹)
                    </button>
                    <button 
                      onClick={() => handleCurrencyChange('USD')}
                      style={{ padding: '8px', borderRadius: '8px', background: baseCurrency === 'USD' ? 'rgba(0,212,170,0.2)' : 'rgba(255,255,255,0.05)', border: baseCurrency === 'USD' ? '1px solid #00d4aa' : '1px solid rgba(255,255,255,0.1)', color: baseCurrency === 'USD' ? '#00d4aa' : 'rgba(255,255,255,0.7)', fontWeight: 600, cursor: 'pointer' }}
                    >
                      USD ($)
                    </button>
                  </div>
                </div>
                <div style={{ paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <Link 
                    href="/profile"
                    onClick={() => setActiveDropdown(null)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '10px', borderRadius: '8px', background: 'linear-gradient(135deg, rgba(0,212,170,0.15) 0%, rgba(59,130,246,0.15) 100%)', border: '1px solid rgba(0,212,170,0.4)', color: '#00d4aa', fontWeight: 'bold', fontSize: '12.5px', textDecoration: 'none', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(0,212,170,0.1)' }}
                  >
                    <User size={16} /> Open Profile Customization
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
