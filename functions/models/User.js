import bcrypt from 'bcryptjs';

export const USER_COLLECTION = 'users';

export const UserSchema = {
    prepare: async (userData) => {
        const salt = await bcrypt.genSalt(4);
        const hashedPassword = await bcrypt.hash(userData.password, salt);

        return {
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email.toLowerCase(),
            phone: userData.phone,
            password: hashedPassword,
            role: userData.role || 'patient',
            createdAt: new Date(),
            updatedAt: new Date()
        };
    },

    comparePassword: async (candidatePassword, hashedPassword) => {
        return await bcrypt.compare(candidatePassword, hashedPassword);
    }
};

export default UserSchema;
