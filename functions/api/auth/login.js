import jwt from 'jsonwebtoken';
import { connectToDatabase } from '../../utils/db.js';
import User from '../../models/User.js';

export const onRequestPost = async (context) => {
    const { request, env } = context;

    try {
        const { email, password } = await request.json();

        // 1. Check for Admin Login
        if (email === env.ADMIN_ID && password === env.ADMIN_PASSWORD) {
            const token = jwt.sign(
                { user: { id: 'admin', role: 'ADMIN' } },
                env.JWT_SECRET || 'fallback_secret',
                { expiresIn: '7d' }
            );

            return new Response(JSON.stringify({
                message: "Connexion réussie",
                token,
                user: { email, role: 'ADMIN', name: 'Administrateur' }
            }), {
                status: 200,
                headers: { "Content-Type": "application/json" }
            });
        }

        // 2. Patient / Standard User Login via MongoDB
        await connectToDatabase(env);

        const user = await User.findOne({ email });
        if (!user) {
            return new Response(JSON.stringify({ message: "Identifiants invalides." }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return new Response(JSON.stringify({ message: "Identifiants invalides." }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        // 3. Generate Token for User
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
            message: "Connexion réussie.",
            token,
            user: { firstName: user.firstName, lastName: user.lastName, email: user.email }
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (err) {
        console.error('Erreur lors de la connexion:', err.message);
        return new Response(JSON.stringify({ message: 'Erreur serveur' }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};
