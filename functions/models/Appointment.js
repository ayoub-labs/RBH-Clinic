export const APPOINTMENT_COLLECTION = 'appointments';

export const AppointmentSchema = {
    prepare: (appointmentData) => {
        return {
            userId: appointmentData.userId,
            name: appointmentData.name,
            date: appointmentData.date, // format "YYYY-MM-DD HH:mm"
            city: appointmentData.city,
            status: appointmentData.status || 'En attente',
            createdAt: new Date(),
            updatedAt: new Date()
        };
    }
};

export default AppointmentSchema;
