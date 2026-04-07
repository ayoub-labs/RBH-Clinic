import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: String, // format "YYYY-MM-DD HH:mm"
        required: true
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['En attente', 'Confirmé', 'Annulé'],
        default: 'En attente'
    }
}, { timestamps: true });

// Check if model already compiled to prevent recompilation in serverless contexts
export default mongoose.models.Appointment || mongoose.model('Appointment', appointmentSchema);
