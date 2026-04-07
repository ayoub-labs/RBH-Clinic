import { MongoClient, ServerApiVersion } from 'mongodb';
import { connect } from 'cloudflare:sockets';

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
            },
            // THE HOLY GRAIL: Use Cloudflare's native TCP sockets directly
            // This avoids all the Node.js polyfill bugs
            stream: (address) => {
                console.log(`📡 Opening native Edge socket to ${address.host}:${address.port}`);
                return connect(`${address.host}:${address.port}`, {
                    secureTransport: 'on' // Use TLS
                });
            },
            connectTimeoutMS: 20000,
            socketTimeoutMS: 45000,
            maxPoolSize: 1
        });

        await client.connect();
        const db = client.db();

        cachedClient = client;
        cachedDb = db;

        console.log("✅ Successfully connected to MongoDB via Native Edge Sockets");
        return { client, db };
    } catch (error) {
        console.error("❌ MongoDB connection error:", error.message);
        throw new Error(`Connection Failed: ${error.message}`);
    }
}
