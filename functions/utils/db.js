// NUCLEAR Edge Socket Patch: Intercept and wrap the actual connection factories
import net from 'node:net';
import tls from 'node:tls';
import { EventEmitter } from 'node:events';

// Function to safely inject .once() into a socket instance
const injectOnce = (socket) => {
    if (socket && !socket.once) {
        socket.once = function (event, listener) {
            const wrapper = (...args) => {
                this.removeListener(event, wrapper);
                listener.apply(this, args);
            };
            return this.on(event, wrapper);
        };
    }
    return socket;
};

// Wrap net.connect and net.createConnection
const originalNetConnect = net.connect;
net.connect = function (...args) {
    return injectOnce(originalNetConnect.apply(this, args));
};
net.createConnection = net.connect;

// Wrap tls.connect
const originalTlsConnect = tls.connect;
tls.connect = function (...args) {
    return injectOnce(originalTlsConnect.apply(this, args));
};

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
            connectTimeoutMS: 20000,
            socketTimeoutMS: 45000,
            maxPoolSize: 1,
            // Force direct connection to avoid SRV-related socket issues
            directConnection: MONGO_URI.includes('shard') && !MONGO_URI.includes('+srv')
        });

        await client.connect();
        const db = client.db();

        cachedClient = client;
        cachedDb = db;

        console.log("✅ Successfully connected to MongoDB via Nuclearly Patched Driver");
        return { client, db };
    } catch (error) {
        console.error("❌ MongoDB connection error:", error.message);
        throw new Error(`Connection Failed: ${error.message}`);
    }
}
