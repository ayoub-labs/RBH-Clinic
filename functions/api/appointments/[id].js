import { ObjectId } from 'mongodb';
import { connectToDatabase } from '../../utils/db.js';
import { APPOINTMENT_COLLECTION } from '../../models/Appointment.js';

// PATCH update appointment status
export const onRequestPatch = async (context) => {
    const { request, params, env } = context;
    const { id } = params;

    try {
        const { status } = await request.json();

        const { db } = await connectToDatabase(env);
        const appointments = db.collection(APPOINTMENT_COLLECTION);

        await appointments.updateOne(
            { _id: new ObjectId(id) },
            { $set: { status, updatedAt: new Date() } }
        );

        return new Response(JSON.stringify({ message: 'Statut mis à jour.' }), {
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

// DELETE appointment
export const onRequestDelete = async (context) => {
    const { params, env } = context;
    const { id } = params;

    try {
        const { db } = await connectToDatabase(env);
        const appointments = db.collection(APPOINTMENT_COLLECTION);

        await appointments.deleteOne({ _id: new ObjectId(id) });

        return new Response(JSON.stringify({ message: 'Rendez-vous annulé.' }), {
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
