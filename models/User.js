import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    bio: { type: String, default: 'Neural Quantitative Investor' },
    ringColor: { type: String, default: '#00d4aa' },
    profilePhoto: { type: String },
    aiMode: { type: String, default: 'Balanced Portfolio Engine' },
    resetToken: { type: String },
    resetTokenExpiry: { type: Date },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", UserSchema);
