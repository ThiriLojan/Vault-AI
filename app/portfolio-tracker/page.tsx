"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import PortfolioCard from "./PortfolioCard";
import AddStockForm from "./AddStockForm";
import PortfolioTrendChart from "./PortfolioTrendChart";
import PortfolioSlider from "./PortfolioSlider";

interface StockData {
    symbol: string;
    buyPrice: number;
    quantity: number;
    currentPrice?: number;
    changePercent?: number;
    industry?: string;
    dateAdded: string;
}

export default function PortfolioTracker() {
    const { data: session } = useSession();
    const [portfolio, setPortfolio] = useState<StockData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [alerts, setAlerts] = useState<string[]>([]);
    const [sortOption, setSortOption] = useState("default");
    const [industryFilter, setIndustryFilter] = useState("all");

    const fetchLiveStockData = async (newStock: StockData) => {
        setLoading(true);
        try {
            const response = await axios.get(
                `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${newStock.symbol}&apikey=${process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY}`
            );
            const livePrice = parseFloat(response.data["Global Quote"]["05. price"]);
            const updatedStock = { ...newStock, currentPrice: livePrice };

            const priceChange = ((livePrice - newStock.buyPrice) / newStock.buyPrice) * 100;
            if (Math.abs(priceChange) >= 5) {
                setAlerts((prevAlerts) => [
                    ...prevAlerts,
                    `⚠️ ${newStock.symbol} has changed by ${priceChange.toFixed(2)}%!`,
                ]);
            }

            setPortfolio((prev) => {
                const mapped = prev.map(s => s.symbol === updatedStock.symbol ? updatedStock : s);
                const u = session?.user?.name || (session?.user as any)?.username || session?.user?.email || "demo";
                localStorage.setItem(`vault_portfolio_tracker_${u}`, JSON.stringify(mapped));
                return mapped;
            });
        } catch (err) {
            setError("Failed to fetch live stock data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const u = session?.user?.name || (session?.user as any)?.username || session?.user?.email || "demo";
        
        // Instant pre-mount local cache hydration
        const localCache = localStorage.getItem(`vault_portfolio_tracker_${u}`);
        if (localCache) {
            try { setPortfolio(JSON.parse(localCache)); } catch(e) {}
        }

        axios.get(`/api/db/holdings?userId=${u}&t=${Date.now()}`).then(res => {
            if (res.data?.holdings?.length > 0) {
                const dbStocks: StockData[] = res.data.holdings.map((h: any) => ({
                    symbol: h.symbol,
                    buyPrice: h.buyPrice || (h.investedAmount / (h.shares || 1)),
                    quantity: h.shares || 1,
                    currentPrice: (h.buyPrice || 100) * 1.15,
                    dateAdded: h.createdAt || new Date().toISOString(),
                    industry: "Technology"
                }));
                setPortfolio(dbStocks);
                localStorage.setItem(`vault_portfolio_tracker_${u}`, JSON.stringify(dbStocks));
            } else if (u === "demo" || u === "demo@vaultai.io" || u === "guest") {
                const mockDemo = [
                    { symbol: "NVDA", buyPrice: 120, quantity: 10, currentPrice: 135, dateAdded: new Date().toISOString(), industry: "Technology" },
                    { symbol: "RELIANCE.NS", buyPrice: 2900, quantity: 50, currentPrice: 3120, dateAdded: new Date().toISOString(), industry: "Energy" },
                    { symbol: "AAPL", buyPrice: 175, quantity: 15, currentPrice: 195, dateAdded: new Date().toISOString(), industry: "Technology" },
                    { symbol: "HDFCBANK.NS", buyPrice: 1520, quantity: 40, currentPrice: 1680, dateAdded: new Date().toISOString(), industry: "Finance" },
                    { symbol: "TSLA", buyPrice: 180, quantity: 8, currentPrice: 220, dateAdded: new Date().toISOString(), industry: "Automotive" },
                    { symbol: "TATAMOTORS.NS", buyPrice: 920, quantity: 100, currentPrice: 995, dateAdded: new Date().toISOString(), industry: "Automotive" }
                ];
                setPortfolio(mockDemo);
                localStorage.setItem(`vault_portfolio_tracker_${u}`, JSON.stringify(mockDemo));
            } else {
                setPortfolio([]);
                localStorage.setItem(`vault_portfolio_tracker_${u}`, "[]");
            }
        }).catch(() => {
            if (u === "demo" && !localCache) {
                setPortfolio([
                    { symbol: "NVDA", buyPrice: 120, quantity: 10, currentPrice: 135, dateAdded: new Date().toISOString(), industry: "Technology" },
                    { symbol: "RELIANCE.NS", buyPrice: 2900, quantity: 50, currentPrice: 3120, dateAdded: new Date().toISOString(), industry: "Energy" }
                ]);
            }
        });
    }, [session]);

    const handleAddStock = async (newStock: StockData) => {
        const u = session?.user?.name || (session?.user as any)?.username || session?.user?.email || "demo";
        const stockWithDate = { ...newStock, dateAdded: new Date().toISOString(), currentPrice: newStock.buyPrice };
        
        // Instant optimistic UI update
        const nextList = [...portfolio, stockWithDate];
        setPortfolio(nextList);
        localStorage.setItem(`vault_portfolio_tracker_${u}`, JSON.stringify(nextList));

        try {
            await axios.post('/api/db/holdings', {
                symbol: newStock.symbol,
                name: newStock.symbol,
                investedAmount: newStock.buyPrice * newStock.quantity,
                shares: newStock.quantity,
                buyPrice: newStock.buyPrice,
                userId: u
            });
        } catch (e) {}
        fetchLiveStockData(stockWithDate);
    };

    const filteredPortfolio = industryFilter === "all"
        ? portfolio
        : portfolio.filter((stock) => stock.industry === industryFilter);

    const sortedPortfolio = [...filteredPortfolio].sort((a, b) => {
        const profitLossA = (a.currentPrice || 0) * a.quantity - a.buyPrice * a.quantity;
        const profitLossB = (b.currentPrice || 0) * b.quantity - b.buyPrice * b.quantity;

        if (sortOption === "highest-gain") {
            return profitLossB - profitLossA;
        } else if (sortOption === "highest-loss") {
            return profitLossA - profitLossB;
        } else if (sortOption === "newest") {
            return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
        } else if (sortOption === "oldest") {
            return new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime();
        } else {
            return 0;
        }
    });

    const trendData = portfolio.map((stock) => ({
        date: stock.dateAdded.split("T")[0],
        value: (stock.currentPrice || 0) * stock.quantity,
    }));

    return (
        <div className="w-full">
            <div className="section-title mb-6 text-2xl">📈 Portfolio Tracker</div>

            {/* Portfolio Slider */}
            {portfolio.length > 0 && (
            <div className="mt-6 w-full overflow-hidden block">
                <PortfolioSlider stocks={portfolio} />
            </div>
            )}

            <div className="dashboard-grid" style={{ marginTop: '36px' }}>
                <div>
                    <AddStockForm onAddStock={handleAddStock} />
                </div>

                {/* Filter Section */}
                <div className="glass-card card-pad">
                    <div className="section-title text-lg mb-4">Filters</div>
                    <div className="grid gap-4">
                        <div>
                            <label className="form-label mb-2">Filter by Industry</label>
                            <select
                                value={industryFilter}
                                onChange={(e) => setIndustryFilter(e.target.value)}
                                className="form-input"
                            >
                                <option value="all">All Industries</option>
                                <option value="Technology">Technology</option>
                                <option value="Finance">Finance</option>
                                <option value="Healthcare">Healthcare</option>
                                <option value="Energy">Energy</option>
                            </select>
                        </div>

                        <div className="mb-0">
                            <label className="form-label mb-2">Sort by</label>
                            <select
                                value={sortOption}
                                onChange={(e) => setSortOption(e.target.value)}
                                className="form-input"
                            >
                                <option value="default">Default</option>
                                <option value="highest-gain">📈 Highest Gain</option>
                                <option value="highest-loss">📉 Highest Loss</option>
                                <option value="newest">🆕 Newest</option>
                                <option value="oldest">📅 Oldest</option>
                            </select>
                        </div>

                        <button className="btn-primary" style={{ marginTop: '40px' }}>
                            Apply Filter
                        </button>
                    </div>
                </div>
            </div>

            {loading && <p className="mt-4 text-yellow-600">Fetching live data...</p>}

            {error && (
                <div className="mt-4 p-4 bg-red-100 border border-red-400 rounded-md">
                    <p className="text-red-800">{error}</p>
                </div>
            )}

            <div className="glass-card chart-wrap">
                <div className="section-title text-lg mb-4">Trend Analysis</div>
                <PortfolioTrendChart data={trendData} />
            </div>
        </div>
    );
}