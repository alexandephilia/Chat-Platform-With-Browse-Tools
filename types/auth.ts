export interface User {
    id: string;
    email: string;
    firstName: string;
    avatar?: string;
    createdAt: Date;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface SignupCredentials {
    firstName: string;
    email: string;
    password: string;
}

export interface AuthContextType extends AuthState {
    login: (credentials: LoginCredentials) => Promise<void>;
    signup: (credentials: SignupCredentials) => Promise<void>;
    logout: () => void;
    updateUser: (updates: Partial<Pick<User, 'firstName' | 'avatar'>>) => void;
    openLoginModal: () => void;
    openSignupModal: () => void;
    closeAuthModal: () => void;
    authModalType: 'login' | 'signup' | null;
}
