// Edge Socket Patch: Cloudflare's polyfills are sometimes missing .once() on sockets
import { EventEmitter } from 'node:events';
import net from 'node:net';
import tls from 'node:tls';

// Apply the patch to standard and TLS sockets
[net.Socket, tls.TLSSocket].forEach(SocketClass => {
    if (SocketClass && SocketClass.prototype && !SocketClass.prototype.once) {
        console.log(`🔧 Patching ${SocketClass.name} with missing .once() method`);
        SocketClass.prototype.once = EventEmitter.prototype.once;
    }
});

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
            },
            // Reduce connection resource usage on Edge
            connectTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            maxPoolSize: 1
        });

        await client.connect();
        const db = client.db();

        cachedClient = client;
        cachedDb = db;

        console.log("✅ Successfully connected to MongoDB via Patched Official Driver");
        return { client, db };
    } catch (error) {
        console.error("❌ MongoDB connection error:", error.message);
        throw error;
    }
}
