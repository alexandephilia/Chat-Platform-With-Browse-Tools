import { LoginCredentials, SignupCredentials, User } from '../types/auth';

const AUTH_STORAGE_KEY = 'zeta_auth_user';

// Simulated auth service - replace with real API calls in production
export const authService = {
    async login(credentials: LoginCredentials): Promise<User> {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // For demo purposes, accept any valid email format
        if (!credentials.email.includes('@')) {
            throw new Error('Invalid email format');
        }
        if (credentials.password.length < 6) {
            throw new Error('Password must be at least 6 characters');
        }

        // Check if user exists in storage (from previous signup)
        const existingUsers = JSON.parse(localStorage.getItem('zeta_users') || '{}');
        const existingUser = existingUsers[credentials.email];

        const user: User = {
            id: existingUser?.id || crypto.randomUUID(),
            email: credentials.email,
            firstName: existingUser?.firstName || credentials.email.split('@')[0].split(/[._-]/)[0],
            createdAt: existingUser?.createdAt ? new Date(existingUser.createdAt) : new Date(),
        };

        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
        return user;
    },

    async signup(credentials: SignupCredentials): Promise<User> {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (!credentials.email.includes('@')) {
            throw new Error('Invalid email format');
        }
        if (credentials.password.length < 6) {
            throw new Error('Password must be at least 6 characters');
        }

        // Validate first name - no spaces allowed, only letters
        const trimmedFirstName = credentials.firstName.trim();
        if (trimmedFirstName.length < 2) {
            throw new Error('First name must be at least 2 characters');
        }
        if (/\s/.test(trimmedFirstName)) {
            throw new Error('Please enter first name only (no spaces)');
        }
        if (!/^[a-zA-Z]+$/.test(trimmedFirstName)) {
            throw new Error('First name should contain only letters');
        }

        const user: User = {
            id: crypto.randomUUID(),
            email: credentials.email,
            firstName: trimmedFirstName.charAt(0).toUpperCase() + trimmedFirstName.slice(1).toLowerCase(),
            createdAt: new Date(),
        };

        // Store user for future logins
        const existingUsers = JSON.parse(localStorage.getItem('zeta_users') || '{}');
        existingUsers[credentials.email] = user;
        localStorage.setItem('zeta_users', JSON.stringify(existingUsers));

        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
        return user;
    },

    logout(): void {
        localStorage.removeItem(AUTH_STORAGE_KEY);
    },

    getCurrentUser(): User | null {
        const stored = localStorage.getItem(AUTH_STORAGE_KEY);
        if (!stored) return null;

        try {
            const user = JSON.parse(stored);
            user.createdAt = new Date(user.createdAt);
            return user;
        } catch {
            return null;
        }
    },

    isAuthenticated(): boolean {
        return this.getCurrentUser() !== null;
    }
};
