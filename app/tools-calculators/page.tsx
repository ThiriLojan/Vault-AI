"use client";

import { useState } from "react";
import Dialog from "@/ui/dialog";

// Calculator Logic
const calculators = [
    { 
        title: "SIP Calculator", 
        key: "sip", 
        labels: ["Monthly Investment", "Expected Return Rate (%)", "Time Period (Years)"],
        logic: (amount: number, rate: number, time: number) => ((amount * ((1 + rate / 12 / 100) ** (time * 12) - 1)) / (rate / 12 / 100) * (1 + rate / 12 / 100)).toFixed(2) 
    },
    { 
        title: "EMI Calculator", 
        key: "emi", 
        labels: ["Loan Amount", "Interest Rate (%)", "Loan Tenure (Years)"],
        logic: (principal: number, rate: number, tenure: number) => {
            const r = rate / 12 / 100;
            const n = tenure * 12;
            return ((principal * r * (1 + r) ** n) / ((1 + r) ** n - 1)).toFixed(2);
        }
    },
    { 
        title: "Lumpsum Calculator", 
        key: "lumpsum", 
        labels: ["Total Investment", "Expected Return Rate (%)", "Time Period (Years)"],
        logic: (amount: number, rate: number, time: number) => (amount * (1 + rate / 100) ** time).toFixed(2) 
    },
    { 
        title: "Retirement", 
        key: "retirement", 
        labels: ["Current Age", "Retirement Age", "Monthly Savings", "Expected Return (%)"],
        logic: (currentAge: number, retirementAge: number, monthlySavings: number, rate: number) => {
            const years = retirementAge - currentAge;
            if (years <= 0) return "0.00";
            const r = rate / 12 / 100;
            const n = years * 12;
            return ((monthlySavings * ((1 + r) ** n - 1) / r) * (1 + r)).toFixed(2);
        }
    },
    { 
        title: "FD Calculator", 
        key: "fd", 
        labels: ["Total Investment", "Interest Rate (%)", "Time Period (Years)"],
        logic: (amount: number, rate: number, time: number) => (amount * (1 + rate / 100) ** time).toFixed(2) 
    },
    { 
        title: "PPF Calculator", 
        key: "ppf", 
        labels: ["Yearly Investment", "Interest Rate (%)", "Time Period (Years)"],
        logic: (amount: number, rate: number, time: number) => {
            const r = rate / 100;
            return (amount * (((1 + r) ** time - 1) / r) * (1 + r)).toFixed(2);
        }
    },
    { 
        title: "Simple Interest", 
        key: "si", 
        labels: ["Principal Amount", "Interest Rate (%)", "Time Period (Years)"],
        logic: (amount: number, rate: number, time: number) => (amount + ((amount * rate * time) / 100)).toFixed(2) 
    },
    { 
        title: "Inflation Impact", 
        key: "inflation", 
        labels: ["Current Monthly Expenses", "Expected Inflation Rate (%)", "Time Period (Years)"],
        logic: (amount: number, rate: number, time: number) => (amount * (1 + rate / 100) ** time).toFixed(2) 
    },
    { 
        title: "CAGR Calculator", 
        key: "cagr", 
        labels: ["Initial Investment", "Final Value", "Time Period (Years)"],
        logic: (initial: number, final: number, years: number) => {
            if (initial <= 0 || years <= 0) return "0.00";
            return ((((final / initial) ** (1 / years)) - 1) * 100).toFixed(2);
        }
    },
];

export default function ToolsAndCalculators() {
    const [inputs, setInputs] = useState<Record<string, string>>({});
    const [result, setResult] = useState<string | null>(null);
    const [openDialog, setOpenDialog] = useState<string | null>(null);

    const handleCalculate = (calculatorKey: string, logic: any) => {
        const values = Object.values(inputs).map(Number);
        setResult(logic(...values));
    };

    const handleDialogClose = () => {
        setOpenDialog(null);
        setInputs({});
        setResult(null);
    };

    const activeCalculator = calculators.find(c => c.key === openDialog);

    return (
        <div className="w-full">
            <div className="section-title mb-6 text-2xl">🛠️ Tools & Calculators</div>
            <p className="mb-8 text-gray-400 max-w-2xl text-lg">
                Plan your financial future with our suite of advanced calculators for investments, loans, and retirement.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10" style={{ marginTop: '48px' }}>
                {calculators.map(({ title, key, logic }) => (
                    <div key={key} onClick={() => setOpenDialog(key)} className="glass-card stat-card flex flex-col items-center justify-center text-center cursor-pointer hover:border-teal-500/50 transition-all group h-full py-10">
                        <div className="w-16 h-16 rounded-full bg-teal-500/10 flex items-center justify-center border border-teal-500/30 mb-8 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(0,212,170,0.15)]">
                            <span className="text-3xl">🧮</span>
                        </div>
                        <h2 className="text-xl font-bold text-white/90">{title}</h2>
                    </div>
                ))}
            </div>

            {activeCalculator && (
                <Dialog isOpen={true} onClose={handleDialogClose} title={activeCalculator.title}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', paddingTop: '10px' }}>
                        {activeCalculator.labels.map((label, index) => (
                            <div key={index}>
                                <label className="form-label" style={{ display: 'block', marginBottom: '10px' }}>{label}</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    placeholder={label}
                                    onChange={(e) => setInputs((prev) => ({ ...prev, [label]: e.target.value }))}
                                />
                            </div>
                        ))}

                        <button
                            onClick={() => handleCalculate(activeCalculator.key, activeCalculator.logic)}
                            className="btn-primary w-full"
                            style={{ marginTop: '18px', padding: '16px', fontSize: '16px', fontWeight: 'bold' }}
                        >
                            Calculate Estimate
                        </button>

                        {result !== null && !isNaN(Number(result)) && (
                            <div className="mt-6 p-4 bg-teal-500/10 border border-teal-500/20 rounded-xl text-center">
                                <p className="text-sm text-teal-400/80 uppercase tracking-widest font-bold mb-1">Estimated Result</p>
                                <p className="text-3xl text-teal-400 font-bold" style={{ fontFamily: "'Syne', sans-serif", textShadow: '0 0 20px rgba(0,212,170,0.2)' }}>
                                    ₹{parseFloat(result).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                </p>
                            </div>
                        )}
                    </div>
                </Dialog>
            )}
        </div>
    );
}
