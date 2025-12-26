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

    const updateUser = useCallback((updates: Partial<Pick<import('../types/auth').User, 'firstName' | 'avatar'>>) => {
        if (!authState.user) return;
        
        const updatedUser = { ...authState.user, ...updates };
        
        // Update localStorage
        localStorage.setItem('zeta_auth_user', JSON.stringify(updatedUser));
        
        // Update stored users list as well
        const existingUsers = JSON.parse(localStorage.getItem('zeta_users') || '{}');
        if (existingUsers[updatedUser.email]) {
            existingUsers[updatedUser.email] = updatedUser;
            localStorage.setItem('zeta_users', JSON.stringify(existingUsers));
        }
        
        // Update context state - triggers re-render in all consumers
        setAuthState(prev => ({
            ...prev,
            user: updatedUser,
        }));
    }, [authState.user]);

    const openLoginModal = useCallback(() => setAuthModalType('login'), []);
    const openSignupModal = useCallback(() => setAuthModalType('signup'), []);
    const closeAuthModal = useCallback(() => setAuthModalType(null), []);

    const value: AuthContextType = {
        ...authState,
        login,
        signup,
        logout,
        updateUser,
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
