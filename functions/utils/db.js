import mongoose from 'mongoose';

// Handle ESM/CJS interop for Mongoose in Cloudflare environment
const m = mongoose.default || mongoose;

let cachedDb = null;

export async function connectToDatabase(env) {
    if (cachedDb) {
        return cachedDb;
    }

    const { MONGO_URI } = env;

    if (!MONGO_URI) {
        throw new Error('Please define the MONGO_URI environment variable');
    }

    try {
        const opts = {
            bufferCommands: false,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000
        };

        // Use the resolved mongoose object
        const conn = await m.connect(MONGO_URI, opts);
        cachedDb = conn;
        console.log("✅ Successfully connected to MongoDB from Cloudflare Functions");
        return conn;
    } catch (error) {
        console.error("❌ MongoDB connection error:", error.message);
        throw error;
    }
}

export { m as mongoose };
