import { connectToDatabase } from '../../utils/db.js';
import User from '../../models/User.js';

export const onRequestGet = async (context) => {
    try {
        await connectToDatabase(context.env);

        // Fetch all users securely (excluding passwords)
        const users = await User.find().select('-password').sort({ createdAt: -1 });

        return new Response(JSON.stringify(users), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
};
