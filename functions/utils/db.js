import { MongoClient, ServerApiVersion } from 'mongodb';
import { EventEmitter } from 'node:events';
import net from 'node:net';
import tls from 'node:tls';

/**
 * BridgeSocket: A total emulator that wraps a Cloudflare stream-based socket
 * and adds the entire Node.js EventEmitter system (on, once, removeListener).
 */
class BridgeSocket extends EventEmitter {
    constructor(rawSocket) {
        super();
        this.raw = rawSocket;
        this.writable = true;
        this.readable = true;

        // Forward basic methods
        this.write = (data) => this.raw.write ? this.raw.write(data) : null;
        this.end = () => this.raw.end ? this.raw.end() : null;
        this.destroy = () => this.raw.destroy ? this.raw.destroy() : null;
        this.pause = () => this.raw.pause ? this.raw.pause() : null;
        this.resume = () => this.raw.resume ? this.raw.resume() : null;
        this.setTimeout = (ms) => this.raw.setTimeout ? this.raw.setTimeout(ms) : null;
        this.setNoDelay = (val) => this.raw.setNoDelay ? this.raw.setNoDelay(val) : null;

        // Manually bridge internal events if the raw socket has any mechanism for them
        // If not, we rely on the fact that Mongoose/MongoDB will call .on('data', ...) 
        // and we will ensure those calls go to our EventEmitter 'this'.
    }

    // Ensure .on and .once are explicitly handled via EventEmitter inheritance
}

// Intercept the connection factories to return our BridgeSocket
const wrap = (originalConnect) => {
    return function (...args) {
        const socket = originalConnect.apply(this, args);
        console.log("🛠️  Wrapping native socket in BridgeSocket Emulator");

        // Deep injection of EventEmitter methods onto the instance
        const bridge = new BridgeSocket(socket);

        // Copy EventEmitter methods directly onto the socket object to bypass all blocks
        socket.on = bridge.on.bind(bridge);
        socket.once = bridge.once.bind(bridge);
        socket.removeListener = bridge.removeListener.bind(bridge);
        socket.off = bridge.off.bind(bridge);
        socket.emit = bridge.emit.bind(bridge);

        return socket;
    };
};

net.connect = wrap(net.connect);
net.createConnection = net.connect;
tls.connect = wrap(tls.connect);

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
            connectTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            maxPoolSize: 1,
            // standard driver options
        });

        await client.connect();
        const db = client.db();

        cachedClient = client;
        cachedDb = db;

        console.log("✅ Successfully connected to MongoDB via BridgeSocket Emulator");
        return { client, db };
    } catch (error) {
        console.error("❌ MongoDB connection error:", error.message);
        throw new Error(`Connection Failed: ${error.message}`);
    }
}
