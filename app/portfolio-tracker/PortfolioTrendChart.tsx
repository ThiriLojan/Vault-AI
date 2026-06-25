"use client";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

interface TrendChartProps {
    data: {
        date: string;
        value: number;
    }[];
}

export default function PortfolioTrendChart({ data }: TrendChartProps) {
    return (
        <div className="w-full h-full">
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" tick={{fill: 'rgba(255,255,255,0.5)'}} />
                    <YAxis stroke="rgba(255,255,255,0.3)" tick={{fill: 'rgba(255,255,255,0.5)'}} />
                    <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(8, 11, 22, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                        itemStyle={{ color: '#00d4aa' }}
                    />
                    <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" vertical={false} />
                    <Line type="monotone" dataKey="value" stroke="#00d4aa" strokeWidth={3} dot={{ r: 4, fill: '#00d4aa', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#fff', stroke: '#00d4aa', strokeWidth: 2 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
