"use client";
import { useState } from "react";

interface StockData {
    symbol: string;
    buyPrice: number;
    quantity: number;
    industry?: string;
}

interface AddStockFormProps {
    onAddStock: (stock: StockData) => void;
}

export default function AddStockForm({ onAddStock }: AddStockFormProps) {
    const [stockData, setStockData] = useState<StockData>({
        symbol: "",
        buyPrice: 0,
        quantity: 0,
        industry: "Technology",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setStockData((prev) => ({
            ...prev,
            [name]: name === "buyPrice" || name === "quantity" ? parseFloat(value) : value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!stockData.symbol.trim()) return;
        onAddStock(stockData);
        setStockData({ symbol: "", buyPrice: 0, quantity: 0, industry: "Technology" });
    };

    return (
        <form onSubmit={handleSubmit} className="glass-card card-pad h-full">
            <div className="section-title text-lg mb-4">Add New Asset</div>
            
            <div className="mb-8">
                <label className="form-label mb-2">Stock Symbol</label>
                <input
                    type="text"
                    name="symbol"
                    value={stockData.symbol}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g. AAPL"
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-6" style={{ marginTop: '32px' }}>
                <div>
                    <label className="form-label mb-2">Buy Price</label>
                    <input
                        type="number"
                        name="buyPrice"
                        value={stockData.buyPrice || ""}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="0.00"
                        required
                    />
                </div>

                <div>
                    <label className="form-label mb-2">Quantity</label>
                    <input
                        type="number"
                        name="quantity"
                        value={stockData.quantity || ""}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="0"
                        required
                    />
                </div>
            </div>

            <div style={{ marginTop: '32px' }}>
                <label className="form-label mb-2">Industry</label>
                <select
                    name="industry"
                    value={stockData.industry}
                    onChange={handleChange}
                    className="form-input"
                >
                    <option value="Technology">Technology</option>
                    <option value="Finance">Finance</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Energy">Energy</option>
                </select>
            </div>

            <button
                type="submit"
                className="btn-primary w-full"
                style={{ marginTop: '40px' }}
            >
                Add Stock
            </button>
        </form>
    );
}
