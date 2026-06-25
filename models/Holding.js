import mongoose from 'mongoose';

const HoldingSchema = new mongoose.Schema({
    userId: { type: String, required: true, default: "demo_user" },
    symbol: { type: String, required: true },
    name: { type: String, required: true },
    investedAmount: { type: Number, required: true },
    shares: { type: Number, required: true },
    buyPrice: { type: Number, required: true },
}, { timestamps: true });

export default mongoose.models.Holding || mongoose.model("Holding", HoldingSchema);
