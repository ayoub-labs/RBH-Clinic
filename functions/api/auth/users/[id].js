import { ObjectId } from 'mongodb';
import { connectToDatabase } from '../../../utils/db.js';
import { USER_COLLECTION } from '../../../models/User.js';
import { APPOINTMENT_COLLECTION } from '../../../models/Appointment.js';

export const onRequestDelete = async (context) => {
    try {
        const { db } = await connectToDatabase(context.env);
        const { params } = context;
        const id = params.id;

        const users = db.collection(USER_COLLECTION);
        const appointments = db.collection(APPOINTMENT_COLLECTION);

        await users.deleteOne({ _id: new ObjectId(id) });
        await appointments.deleteMany({ userId: id });

        return new Response(JSON.stringify({ message: "Utilisateur supprimé avec succès" }), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
};

export const onRequestPut = async (context) => {
    try {
        const { db } = await connectToDatabase(context.env);
        const { params, request } = context;
        const id = params.id;
        const body = await request.json();

        // Remove password from update if not provided
        if (!body.password) {
            delete body.password;
        }

        const users = db.collection(USER_COLLECTION);

        await users.updateOne(
            { _id: new ObjectId(id) },
            { $set: { ...body, updatedAt: new Date() } }
        );

        // Fetch the updated user (excluding password)
        const updated = await users.findOne(
            { _id: new ObjectId(id) },
            { projection: { password: 0 } }
        );

        return new Response(JSON.stringify(updated), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
};
