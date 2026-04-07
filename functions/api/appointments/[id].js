import { connectToDatabase } from '../../utils/db.js';
import Appointment from '../../models/Appointment.js';

export const onRequestDelete = async (context) => {
    try {
        await connectToDatabase(context.env);
        const { params } = context;
        const id = params.id;

        await Appointment.findByIdAndDelete(id);
        return new Response(JSON.stringify({ message: "Supprimé avec succès" }), {
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

        const updated = await Appointment.findByIdAndUpdate(id, body, { new: true });

        return new Response(JSON.stringify({ id: updated._id, ...updated._doc }), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
};
