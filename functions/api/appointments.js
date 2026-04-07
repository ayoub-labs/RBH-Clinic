import { connectToDatabase } from '../utils/db.js';
import Appointment from '../models/Appointment.js';
import jwt from 'jsonwebtoken';

export const onRequestGet = async (context) => {
    try {
        await connectToDatabase(context.env);
        const appointments = await Appointment.find().sort({ date: 1 });
        const mappedAppts = appointments.map(app => ({
            id: app._id,
            name: app.name,
            date: app.date,
            city: app.city,
            status: app.status
        }));
        return new Response(JSON.stringify(mappedAppts), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
};

export const onRequestPost = async (context) => {
    try {
        await connectToDatabase(context.env);
        const { request, env } = context;

        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return new Response(JSON.stringify({ message: "Non autorisé" }), { status: 401, headers: { "Content-Type": "application/json" } });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, env.JWT_SECRET || 'fallback_secret');
        const userId = decoded.user.id;

        const body = await request.json();

        const newAppt = new Appointment({
            userId,
            name: body.name,
            date: body.date,
            city: body.city,
            status: 'En attente'
        });

        const saved = await newAppt.save();

        const responseObj = {
            id: saved._id,
            name: saved.name,
            date: saved.date,
            city: saved.city,
            status: saved.status
        };

        return new Response(JSON.stringify(responseObj), {
            status: 201,
            headers: { "Content-Type": "application/json" }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
};
