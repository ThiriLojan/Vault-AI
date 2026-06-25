import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/vault_ai";

if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI in your .env file");
}

let cached = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
    global.mongoose = cached;
}

export async function connectToDatabase() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI).then((mongooseInstance) => {
            console.log("✅ Successfully connected to MongoDB:", MONGODB_URI);
            return mongooseInstance;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}
