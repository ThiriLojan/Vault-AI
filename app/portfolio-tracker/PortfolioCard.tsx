import React, { useState, useEffect } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface PortfolioCardProps {
    stock: {
        symbol: string;
        buyPrice: number;
        quantity: number;
        currentPrice?: number;
    };
}

export default function PortfolioCard({ stock }: PortfolioCardProps) {
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

    const formatMoney = (amount: number) => {
        if (currency === 'USD') {
            const usdAmount = amount > 500 ? amount / 83.5 : amount; // adjust if base is INR vs USD
            return `$${usdAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
        const inrAmount = amount < 100 ? amount * 83.5 : amount; // adjust if base is USD vs INR
        return `₹${inrAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const totalInvestment = stock.buyPrice * stock.quantity;
    const currentValue = (stock.currentPrice || stock.buyPrice) * stock.quantity;
    const profitLoss = currentValue - totalInvestment;
    const isProfit = profitLoss >= 0;
    const percentageChange = totalInvestment > 0 ? (profitLoss / totalInvestment) * 100 : 0;

    return (
        <div className="glass-card stat-card h-full flex flex-col justify-between">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <div className="stat-card-label">{stock.symbol}</div>
                    <div className="stat-card-val">{formatMoney(stock.currentPrice || stock.buyPrice)}</div>
                    {stock.currentPrice && (
                        <div className={`stat-card-change ${isProfit ? 'change-up' : 'change-down'}`}>
                            {isProfit ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                            {Math.abs(percentageChange).toFixed(2)}%
                        </div>
                    )}
                </div>
                <div className="text-right">
                    <div className="stat-card-label">Quantity</div>
                    <div className="text-white font-bold" style={{ fontFamily: "'Syne', sans-serif", fontSize: '18px' }}>{stock.quantity}</div>
                </div>
            </div>
            
            <div className="pt-4 border-t border-white/5 flex justify-between">
                <div>
                    <div className="stat-card-label" style={{marginBottom: '4px'}}>Total Inv</div>
                    <div className="text-base font-semibold text-white/90" style={{ fontFamily: "'Syne', sans-serif" }}>{formatMoney(totalInvestment)}</div>
                </div>
                <div className="text-right">
                    <div className="stat-card-label" style={{marginBottom: '4px'}}>P/L</div>
                    <div className={`text-base font-bold ${isProfit ? 'text-teal-400' : 'text-red-400'}`} style={{ fontFamily: "'Syne', sans-serif" }}>
                        {isProfit ? "+" : ""}{formatMoney(profitLoss)}
                    </div>
                </div>
            </div>
        </div>
    );
}
