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

        const user: User = {
            id: crypto.randomUUID(),
            email: credentials.email,
            name: credentials.email.split('@')[0],
            createdAt: new Date(),
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
        if (credentials.name.length < 2) {
            throw new Error('Name must be at least 2 characters');
        }

        const user: User = {
            id: crypto.randomUUID(),
            email: credentials.email,
            name: credentials.name,
            createdAt: new Date(),
        };

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
