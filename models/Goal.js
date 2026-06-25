import mongoose from 'mongoose';

const GoalSchema = new mongoose.Schema({
    userId: { type: String, required: true, default: "demo_user" },
    title: { type: String, required: true },
    category: { type: String, default: "Savings" },
    targetAmount: { type: Number, required: true },
    currentAmount: { type: Number, default: 0 },
    deadline: { type: String, required: true },
    isCompleted: { type: Boolean, default: false },
    completedDate: { type: String },
}, { timestamps: true });

export default mongoose.models.Goal || mongoose.model("Goal", GoalSchema);
