import jwt from 'jsonwebtoken';
import { connectToDatabase } from '../../utils/db.js';
import { USER_COLLECTION, UserSchema } from '../../models/User.js';

export const onRequestPost = async (context) => {
    const { request, env } = context;

    try {
        const { firstName, lastName, email, phone, password } = await request.json();

        // Ensure DB connection
        const { db } = await connectToDatabase(env);
        const users = db.collection(USER_COLLECTION);

        // Check if user already exists
        const existingUser = await users.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return new Response(JSON.stringify({ message: 'Un utilisateur avec cet email existe déjà.' }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        // Prepare and insert user
        const userData = await UserSchema.prepare({
            firstName,
            lastName,
            email,
            phone,
            password,
            role: 'patient'
        });

        const result = await users.insertOne(userData);

        // Generate JWT
        const payload = {
            user: {
                id: result.insertedId.toString(),
                role: userData.role
            }
        };

        const token = jwt.sign(payload, env.JWT_SECRET || 'fallback_secret', {
            expiresIn: '7d'
        });

        return new Response(JSON.stringify({
            token,
            user: { firstName, lastName, email: email.toLowerCase() },
            message: 'Inscription réussie.'
        }), {
            status: 201,
            headers: { "Content-Type": "application/json" }
        });

    } catch (err) {
        console.error('Erreur lors de l\'inscription:', err.message);
        return new Response(JSON.stringify({ message: 'Erreur serveur', debug: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};
