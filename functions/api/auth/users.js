import { connectToDatabase } from '../../utils/db.js';
import { USER_COLLECTION } from '../../models/User.js';

export const onRequestGet = async (context) => {
    try {
        const { db } = await connectToDatabase(context.env);
        const usersCollection = db.collection(USER_COLLECTION);

        // Fetch all users securely (excluding passwords)
        const users = await usersCollection.find({}, {
            projection: { password: 0 },
            sort: { createdAt: -1 }
        }).toArray();

        return new Response(JSON.stringify(users), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};
