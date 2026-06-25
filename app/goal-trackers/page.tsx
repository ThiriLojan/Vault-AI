"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Dialog from "@/ui/dialog";

interface Goal {
    id: any;
    title: string;
    category: string;
    targetAmount: number;
    currentAmount: number;
    deadline: string;
    completedDate?: string;
}

export default function GoalTracker() {
    const { data: session } = useSession();
    const [goals, setGoals] = useState<Goal[]>([]);
    const [completedGoals, setCompletedGoals] = useState<Goal[]>([]);

    useEffect(() => {
        const u = session?.user?.name || (session?.user as any)?.username || "demo";
        fetch(`/api/db/goals?userId=${u}`)
            .then(res => res.json())
            .then(data => {
                if (data.success && data.goals) {
                    if (data.goals.length > 0) {
                        const active = data.goals.filter((g: any) => !g.isCompleted).map((g: any) => ({ id: g._id, title: g.title, category: g.category, targetAmount: g.targetAmount, currentAmount: g.currentAmount, deadline: g.deadline }));
                        const done = data.goals.filter((g: any) => g.isCompleted).map((g: any) => ({ id: g._id, title: g.title, category: g.category, targetAmount: g.targetAmount, currentAmount: g.currentAmount, deadline: g.deadline, completedDate: g.completedDate || 'Recently' }));
                        setGoals(active);
                        setCompletedGoals(done);
                    } else if (u === "demo") {
                        setGoals([
                            { id: 1, title: "Emergency Fund", category: "Savings", targetAmount: 50000, currentAmount: 20000, deadline: "2025-12-31" },
                            { id: 2, title: "Car Purchase", category: "Investments", targetAmount: 700000, currentAmount: 300000, deadline: "2026-06-31" }
                        ]);
                    } else {
                        setGoals([]);
                        setCompletedGoals([]);
                    }
                }
            })
            .catch(() => {
                if (u === "demo") {
                    setGoals([{ id: 1, title: "Emergency Fund", category: "Savings", targetAmount: 50000, currentAmount: 20000, deadline: "2025-12-31" }]);
                } else {
                    setGoals([]);
                    setCompletedGoals([]);
                }
            });
    }, [session]);

    const [showAddDialog, setShowAddDialog] = useState(false);
    const [showRemoveDialog, setShowRemoveDialog] = useState(false);
    const [showUpdateDialog, setShowUpdateDialog] = useState<any | null>(null);
    const [showDetailsDialog, setShowDetailsDialog] = useState<Goal | null>(null);

    const [newGoal, setNewGoal] = useState<Partial<Goal>>({});
    const [updateAmount, setUpdateAmount] = useState<number>(0);
    const [selectedGoals, setSelectedGoals] = useState<any[]>([]);

    const handleUpdateAmount = async (id: any) => {
        if (typeof id === 'string') {
            try {
                await fetch('/api/db/goals', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, addAmount: updateAmount }) });
            } catch (e) {}
        }
        setGoals((prevGoals) =>
            prevGoals.map((goal) => {
                if (goal.id === id) {
                    const updatedAmount = goal.currentAmount + updateAmount;
                    if (updatedAmount >= goal.targetAmount) {
                        setCompletedGoals([
                            ...completedGoals,
                            {
                                ...goal,
                                currentAmount: updatedAmount,
                                completedDate: new Date().toLocaleDateString('en-GB')
                            }
                        ]);
                        return null;
                    }
                    return { ...goal, currentAmount: updatedAmount };
                }
                return goal;
            }).filter(Boolean) as Goal[]
        );
        setShowUpdateDialog(null);
        setUpdateAmount(0);
    };    

    const handleAddGoal = () => setShowAddDialog(true);
    const handleRemoveGoal = () => setShowRemoveDialog(true);

    const handleSaveGoal = async () => {
        if (newGoal.title && newGoal.category && newGoal.targetAmount && newGoal.deadline) {
            const u = session?.user?.name || (session?.user as any)?.username || "demo";
            try {
                const res = await fetch('/api/db/goals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...newGoal, currentAmount: newGoal.currentAmount || 0, userId: u }) });
                const data = await res.json();
                if (data.success && data.goal) {
                    const g = data.goal;
                    setGoals([...goals, { id: g._id, title: g.title, category: g.category, targetAmount: g.targetAmount, currentAmount: g.currentAmount, deadline: g.deadline }]);
                    setNewGoal({});
                    setShowAddDialog(false);
                    return;
                }
            } catch (e) {}
            setGoals([...goals, { ...newGoal, id: Date.now(), currentAmount: newGoal.currentAmount || 0 } as Goal]);
            setNewGoal({});
            setShowAddDialog(false);
        }
    };

    const handleConfirmRemoveGoals = () => {
        setGoals((prevGoals) => prevGoals.filter((goal) => !selectedGoals.includes(goal.id)));
        setSelectedGoals([]);
        setShowRemoveDialog(false);
    };

    const handleForecloseGoal = (id: number) => {
        const currentDate = new Date().toLocaleDateString('en-GB');
    
        setGoals((prevGoals) =>
            prevGoals.map((goal) => {
                if (goal.id === id) {
                    setCompletedGoals([
                        ...completedGoals,
                        { ...goal, completedDate: currentDate }
                    ]);
                    return null;
                }
                return goal;
            }).filter(Boolean) as Goal[]
        );
    
        setShowUpdateDialog(null);
    };    

    return (
        <div className="w-full">
            <div className="section-title mb-6 text-2xl">🎯 Goal Tracker</div>
            <p className="mb-8 text-gray-400 max-w-2xl text-lg">
                Track your savings and investment goals. Update your progress and celebrate your milestones.
            </p>

            {/* Action Buttons */}
            <div className="flex gap-4" style={{ marginTop: '40px', marginBottom: '40px' }}>
                <button className="btn-primary" style={{ width: 'fit-content', paddingLeft: '32px', paddingRight: '32px' }} onClick={handleAddGoal}>Add New Goal</button>
                <button className="bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all whitespace-nowrap" style={{ width: 'fit-content', padding: '14px 32px', borderRadius: '12px', fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '15px' }} onClick={handleRemoveGoal}>Remove Goal</button>
            </div>

            {/* Ongoing Goals Section */}
            <div className="section-title text-lg" style={{ marginBottom: '40px' }}>Ongoing Goals</div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
                {goals.map(({ id, title, category, targetAmount, currentAmount, deadline }) => (
                    <div key={id} className="glass-card flex flex-col justify-between h-full w-full min-h-[260px]" style={{ padding: '24px' }}>
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-white font-bold text-xl mb-2">{title}</h2>
                                <span className="text-teal-400 font-medium text-xs bg-teal-500/10 px-2 py-1 rounded border border-teal-500/20 tracking-wider uppercase inline-block">{category}</span>
                            </div>
                            <div className="text-right">
                                <div className="stat-card-label">Deadline</div>
                                <div className="text-white/80 font-medium" style={{ fontFamily: "'Syne', sans-serif" }}>{deadline}</div>
                            </div>
                        </div>

                        <div className="mb-6">
                            <div className="flex justify-between text-base mb-4 font-bold">
                                <span className="text-white/90">₹{currentAmount.toLocaleString('en-IN')}</span>
                                <span className="text-white/50">₹{targetAmount.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="w-full bg-white/5 h-4 rounded-full overflow-hidden shadow-inner border border-white/5">
                                <div 
                                    className="bg-teal-400 h-full rounded-full shadow-[0_0_10px_rgba(0,212,170,0.8)] transition-all duration-500" 
                                    style={{ width: `${Math.min((currentAmount / targetAmount) * 100, 100)}%` }}
                                ></div>
                            </div>
                        </div>

                        <button
                            className="w-full py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-white font-bold text-base"
                            onClick={() => setShowUpdateDialog(id)}
                        >
                            Update Progress
                        </button>
                    </div>
                ))}
            </div>
            
            {/* Completed Goals Section */}
            {completedGoals.length > 0 && (
                <>
                    <div className="section-title text-lg mb-6" style={{ marginTop: '40px' }}>Completed Goals</div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
                        {completedGoals.map((goal) => (
                            <div key={goal.id} className="glass-card flex items-center gap-6 cursor-pointer hover:border-teal-500/30 transition-all min-h-[140px]" style={{ padding: '32px' }} onClick={() => setShowDetailsDialog(goal)}>
                                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.15)] shrink-0">
                                    <span className="text-2xl">🏆</span>
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white/90">{goal.title}</h2>
                                    <p className="text-white/50 text-sm">Completed: {goal.completedDate}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Goal Details Dialog */}
            {showDetailsDialog && (
                <Dialog
                    isOpen={!!showDetailsDialog}
                    onClose={() => setShowDetailsDialog(null)}
                    title="Goal Details"
                >
                    <div className="space-y-4">
                        <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
                            <div className="flex justify-between"><span className="text-white/50">Title</span> <span className="text-white font-bold">{showDetailsDialog.title}</span></div>
                            <div className="flex justify-between"><span className="text-white/50">Category</span> <span className="text-white">{showDetailsDialog.category}</span></div>
                            <div className="flex justify-between"><span className="text-white/50">Target Amount</span> <span className="text-teal-400 font-bold">₹{showDetailsDialog.targetAmount.toLocaleString('en-IN')}</span></div>
                            <div className="flex justify-between"><span className="text-white/50">Completed Amount</span> <span className="text-green-400 font-bold">₹{showDetailsDialog.currentAmount.toLocaleString('en-IN')}</span></div>
                            <div className="flex justify-between"><span className="text-white/50">Deadline</span> <span className="text-white/80">{new Date(showDetailsDialog.deadline).toLocaleDateString('en-GB')}</span></div>
                            <div className="flex justify-between"><span className="text-white/50">Completed Date</span> <span className="text-white/80">{showDetailsDialog.completedDate || 'N/A'}</span></div>
                        </div>
                    </div>
                </Dialog>
            )}

            {/* Add Goal Dialog */}
            {showAddDialog && (
            <Dialog isOpen={showAddDialog} onClose={() => setShowAddDialog(false)} title="Add New Goal">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', paddingTop: '8px' }}>
                    <div>
                        <label className="form-label" style={{ marginBottom: '10px', display: 'block' }}>Goal Title</label>
                        <input 
                            type="text" 
                            placeholder="e.g., House Downpayment" 
                            className="form-input" 
                            onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })} 
                        />
                    </div>
                    <div>
                        <label className="form-label" style={{ marginBottom: '10px', display: 'block' }}>Category</label>
                        <select
                            className="form-input text-white"
                            onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                        >
                            <option value="" style={{ backgroundColor: '#0d1527', color: '#fff', padding: '10px' }}>Select Category</option>
                            <option value="Savings" style={{ backgroundColor: '#0d1527', color: '#fff', padding: '10px' }}>Savings</option>
                            <option value="Investments" style={{ backgroundColor: '#0d1527', color: '#fff', padding: '10px' }}>Investments</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                        <div>
                            <label className="form-label" style={{ marginBottom: '10px', display: 'block' }}>Target Amount</label>
                            <input 
                                type="number" 
                                placeholder="₹0" 
                                className="form-input" 
                                onChange={(e) => setNewGoal({ ...newGoal, targetAmount: Number(e.target.value) })} 
                            />
                        </div>
                        <div>
                            <label className="form-label" style={{ marginBottom: '10px', display: 'block' }}>Current Amount</label>
                            <input 
                                type="number" 
                                placeholder="₹0" 
                                className="form-input" 
                                onChange={(e) => setNewGoal({ ...newGoal, currentAmount: Number(e.target.value) })} 
                            />
                        </div>
                    </div>
                    <div>
                        <label className="form-label" style={{ marginBottom: '10px', display: 'block' }}>Target Date</label>
                        <input 
                            type="date" 
                            className="form-input" 
                            onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })} 
                        />
                    </div>
                    <button
                        className="btn-primary w-full"
                        style={{ marginTop: '14px', padding: '15px' }}
                        onClick={handleSaveGoal}
                    >
                        Save Goal
                    </button>
                </div>
            </Dialog>
            )}

            {/* Remove Goal Dialog */}
            {showRemoveDialog && (
            <Dialog isOpen={showRemoveDialog} onClose={() => setShowRemoveDialog(false)} title="Remove Goals">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px', maxHeight: '300px', overflowY: 'auto', paddingRight: '4px', paddingTop: '8px' }}>
                    {goals.map((goal) => (
                        <label key={goal.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s' }}>
                            <input
                                type="checkbox"
                                style={{ width: '20px', height: '20px', accentColor: '#ef4444', cursor: 'pointer' }}
                                onChange={(e) => {
                                    const updatedSelection = e.target.checked
                                        ? [...selectedGoals, goal.id]
                                        : selectedGoals.filter(id => id !== goal.id);
                                    setSelectedGoals(updatedSelection);
                                }}
                            />
                            <span className="text-white font-medium text-lg">{goal.title}</span>
                        </label>
                    ))}
                    {goals.length === 0 && <div className="text-white/30 text-center py-6">No ongoing goals.</div>}
                </div>
                <button 
                    className="w-full font-bold" 
                    style={{ padding: '16px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', transition: 'all 0.2s', marginTop: '10px' }} 
                    onClick={handleConfirmRemoveGoals}
                >
                    Remove Selected
                </button>
            </Dialog>
            )}

            {/* Update Amount Dialog */}
            {showUpdateDialog !== null && (
                <Dialog isOpen={showUpdateDialog !== null} onClose={() => setShowUpdateDialog(null)} title="Update Progress">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px', paddingTop: '8px' }}>
                        <div>
                            <label className="form-label" style={{ marginBottom: '12px', display: 'block' }}>Add Amount (₹)</label>
                            <input 
                                type="number"
                                className="form-input"
                                placeholder="Enter amount to add"
                                onChange={(e) => setUpdateAmount(Number(e.target.value))}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '16px', marginTop: '10px' }}>
                            <button
                                style={{ flex: 1, padding: '15px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.12)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.25)', fontWeight: 'bold' }}
                                onClick={() => handleForecloseGoal(showUpdateDialog)}
                            >
                                Foreclose
                            </button>
                            <button
                                className="btn-primary"
                                style={{ flex: 1, padding: '15px', fontWeight: 'bold' }}
                                onClick={() => handleUpdateAmount(showUpdateDialog)}
                            >
                                Update
                            </button>
                        </div>
                    </div>
                </Dialog>
            )}
        </div>
    );
}
