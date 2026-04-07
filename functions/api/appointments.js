import { connectToDatabase } from '../utils/db.js';
import { APPOINTMENT_COLLECTION, AppointmentSchema } from '../models/Appointment.js';

// GET all appointments
export const onRequestGet = async (context) => {
    try {
        const { db } = await connectToDatabase(context.env);
        const appointments = await db.collection(APPOINTMENT_COLLECTION)
            .find({})
            .sort({ createdAt: -1 })
            .toArray();

        return new Response(JSON.stringify(appointments), {
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

// POST check if appointment exists and then book it
export const onRequestPost = async (context) => {
    const { request, env } = context;

    try {
        const body = await request.json();
        const { userId, name, date, city } = body;

        const { db } = await connectToDatabase(env);
        const appointments = db.collection(APPOINTMENT_COLLECTION);

        // Check if appointment already exists for this exact slot
        const existing = await appointments.findOne({ date, city });
        if (existing) {
            return new Response(JSON.stringify({ message: 'Ce créneau est déjà réservé.' }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        // Prepare and insert
        const appointmentData = AppointmentSchema.prepare({
            userId,
            name,
            date,
            city,
            status: 'En attente'
        });

        await appointments.insertOne(appointmentData);

        return new Response(JSON.stringify({ message: 'Rendez-vous réservé avec succès.' }), {
            status: 201,
            headers: { "Content-Type": "application/json" }
        });

    } catch (err) {
        return new Response(JSON.stringify({ message: 'Erreur lors de la réservation', error: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};
