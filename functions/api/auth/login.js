import jwt from 'jsonwebtoken';
import { connectToDatabase } from '../../utils/db.js';
import { USER_COLLECTION, UserSchema } from '../../models/User.js';

export const onRequestPost = async (context) => {
    const { request, env } = context;

    try {
        const { email, password } = await request.json();

        // Ensure DB connection
        const { db } = await connectToDatabase(env);
        const users = db.collection(USER_COLLECTION);

        // Find user by email
        const user = await users.findOne({ email: email.toLowerCase() });
        if (!user) {
            return new Response(JSON.stringify({ message: 'Identifiants invalides.' }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        // Verify password
        const isMatch = await UserSchema.comparePassword(password, user.password);
        if (!isMatch) {
            return new Response(JSON.stringify({ message: 'Identifiants invalides.' }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        // Generate JWT
        const payload = {
            user: {
                id: user._id.toString(),
                role: user.role
            }
        };

        const token = jwt.sign(payload, env.JWT_SECRET || 'fallback_secret', {
            expiresIn: '7d'
        });

        return new Response(JSON.stringify({
            token,
            user: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            },
            message: 'Connexion réussie.'
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (err) {
        console.error('Erreur lors de la connexion:', err.message);
        return new Response(JSON.stringify({ message: 'Erreur serveur', debug: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};
