// Using standard connection string (non-SRV) for Cloudflare compatibility
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
        const client = new MongoClient(MONGO_URI, {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
            }
        });

        await client.connect();
        const db = client.db(); // Uses the default DB from the URI

        cachedClient = client;
        cachedDb = db;

        console.log("✅ Successfully connected to MongoDB via Official Driver");
        return { client, db };
    } catch (error) {
        console.error("❌ MongoDB connection error:", error.message);
        throw error;
    }
}
