import { connectToDatabase } from '../../../../utils/db.js';
import User from '../../../../models/User.js';
import Appointment from '../../../../models/Appointment.js';

export const onRequestDelete = async (context) => {
    try {
        await connectToDatabase(context.env);
        const { params } = context;
        const id = params.id;

        await User.findByIdAndDelete(id);
        await Appointment.deleteMany({ userId: id });

        return new Response(JSON.stringify({ message: "Utilisateur supprimé avec succès" }), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
};

export const onRequestPut = async (context) => {
    try {
        await connectToDatabase(context.env);
        const { params, request } = context;
        const id = params.id;
        const body = await request.json();

        if (!body.password) {
            delete body.password;
        }

        const updated = await User.findByIdAndUpdate(id, body, { new: true }).select('-password');

        return new Response(JSON.stringify(updated), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
};
