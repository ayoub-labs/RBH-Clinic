import { connectToDatabase } from '../../../utils/db.js';
import Appointment from '../../../models/Appointment.js';

export const onRequestGet = async (context) => {
    try {
        await connectToDatabase(context.env);
        const { params } = context;
        const name = decodeURIComponent(params.name);

        const appointments = await Appointment.find({ name: new RegExp('^' + name + '$', 'i') }).sort({ date: -1 });

        const mappedAppts = appointments.map(app => ({
            id: app._id,
            name: app.name,
            date: app.date,
            city: app.city,
            status: app.status
        }));

        return new Response(JSON.stringify(mappedAppts), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
};
