import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';
import { AuthContextType, AuthState, LoginCredentials, SignupCredentials } from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        isAuthenticated: false,
        isLoading: true,
    });
    const [authModalType, setAuthModalType] = useState<'login' | 'signup' | null>(null);

    // Check for existing session on mount
    useEffect(() => {
        const user = authService.getCurrentUser();
        setAuthState({
            user,
            isAuthenticated: !!user,
            isLoading: false,
        });
    }, []);

    const login = useCallback(async (credentials: LoginCredentials) => {
        setAuthState(prev => ({ ...prev, isLoading: true }));
        try {
            const user = await authService.login(credentials);
            setAuthState({
                user,
                isAuthenticated: true,
                isLoading: false,
            });
            setAuthModalType(null);
        } catch (error) {
            setAuthState(prev => ({ ...prev, isLoading: false }));
            throw error;
        }
    }, []);

    const signup = useCallback(async (credentials: SignupCredentials) => {
        setAuthState(prev => ({ ...prev, isLoading: true }));
        try {
            const user = await authService.signup(credentials);
            setAuthState({
                user,
                isAuthenticated: true,
                isLoading: false,
            });
            setAuthModalType(null);
        } catch (error) {
            setAuthState(prev => ({ ...prev, isLoading: false }));
            throw error;
        }
    }, []);

    const logout = useCallback(() => {
        authService.logout();
        setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
        });
    }, []);

    const openLoginModal = useCallback(() => setAuthModalType('login'), []);
    const openSignupModal = useCallback(() => setAuthModalType('signup'), []);
    const closeAuthModal = useCallback(() => setAuthModalType(null), []);

    const value: AuthContextType = {
        ...authState,
        login,
        signup,
        logout,
        openLoginModal,
        openSignupModal,
        closeAuthModal,
        authModalType,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
