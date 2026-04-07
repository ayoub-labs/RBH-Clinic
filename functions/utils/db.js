// Native Cloudflare Sockets implementation for MongoDB
import { MongoClient, ServerApiVersion } from 'mongodb';

let cachedClient = null;
let cachedDb = null;

export async function connectToDatabase(env) {
    if (cachedClient && cachedDb) {
        return { client: cachedClient, db: cachedDb };
    }

    const { MONGO_URI } = env;

    if (!MONGO_URI) {
        throw new Error('Please define the MONGO_URI environment variable');
    }

    try {
        // Optimized configuration for Cloudflare Edge
        const client = new MongoClient(MONGO_URI, {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
            },
            // Use the standard driver but with extremely conservative pooling for serverless
            connectTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            maxPoolSize: 1,
            minPoolSize: 0,
            // Force the driver to use the TLS/Net polyfills in a way that respects the Edge lifecycle
            tls: true,
        });

        await client.connect();
        const db = client.db();

        cachedClient = client;
        cachedDb = db;

        console.log("✅ Successfully connected to MongoDB via Edge-Optimized Driver");
        return { client, db };
    } catch (error) {
        console.error("❌ MongoDB connection error:", error.message);
        // Fallback for diagnostic purposes
        throw new Error(`Connection Failed: ${error.message}`);
    }
}
