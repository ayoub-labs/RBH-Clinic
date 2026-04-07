import * as M from 'mongoose';

// Smart resolution for Mongoose object
const mongoose = M.connect ? M : (M.default && M.default.connect ? M.default : M);

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

        // Use the smart-resolved mongoose object
        if (typeof mongoose.connect !== 'function') {
            // One last ditch effort if resolution failed
            const altM = M.default || M;
            if (typeof altM.connect !== 'function') {
                throw new Error(`Mongoose resolution failed. Keys: ${Object.keys(M).join(', ')}`);
            }
            const conn = await altM.connect(MONGO_URI, opts);
            cachedDb = conn;
        } else {
            const conn = await mongoose.connect(MONGO_URI, opts);
            cachedDb = conn;
        }

        console.log("✅ Successfully connected to MongoDB from Cloudflare Functions");
        return cachedDb;
    } catch (error) {
        console.error("❌ MongoDB connection error:", error.message);
        throw error;
    }
}

export { mongoose };
