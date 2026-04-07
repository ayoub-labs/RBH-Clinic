import { connectToDatabase } from '../../../utils/db.js';
import { APPOINTMENT_COLLECTION } from '../../../models/Appointment.js';

export const onRequestGet = async (context) => {
    const { params, env } = context;
    const { name } = params;

    try {
        const decodedName = decodeURIComponent(name);
        const { db } = await connectToDatabase(env);
        const appointments = db.collection(APPOINTMENT_COLLECTION);

        // Fetch user's appointments by name
        const myAppointments = await appointments
            .find({ name: decodedName })
            .sort({ date: 1 })
            .toArray();

        return new Response(JSON.stringify(myAppointments), {
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
