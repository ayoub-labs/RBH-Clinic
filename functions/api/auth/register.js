import jwt from 'jsonwebtoken';
import { connectToDatabase } from '../../utils/db.js';
import User from '../../models/User.js';

export const onRequestPost = async (context) => {
    const { request, env } = context;

    try {
        const { firstName, lastName, email, phone, password } = await request.json();

        // Ensure DB connection
        await connectToDatabase(env);

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return new Response(JSON.stringify({ message: 'Un utilisateur avec cet email existe déjà.' }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        // Create user
        user = new User({
            firstName,
            lastName,
            email,
            phone,
            password
        });

        await user.save();

        // Generate JWT
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        const token = jwt.sign(payload, env.JWT_SECRET || 'fallback_secret', {
            expiresIn: '7d'
        });

        return new Response(JSON.stringify({
            token,
            user: { firstName, lastName, email },
            message: 'Inscription réussie.'
        }), {
            status: 201,
            headers: { "Content-Type": "application/json" }
        });

    } catch (err) {
        console.error('Erreur lors de l\'inscription:', err.message);
        return new Response(JSON.stringify({
            message: 'Erreur serveur',
            debug: err.message
        }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};
