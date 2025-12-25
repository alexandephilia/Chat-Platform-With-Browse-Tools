import { AnimatePresence, motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
};

const modalVariants = {
    hidden: {
        opacity: 0,
        scale: 0.95,
        y: 20
    },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            duration: 0.2,
            ease: [0.4, 0.0, 0.2, 1]
        }
    },
    exit: {
        opacity: 0,
        scale: 0.95,
        y: 20,
        transition: {
            duration: 0.15,
            ease: [0.4, 0.0, 0.2, 1]
        }
    }
};

export const AuthModal: React.FC = () => {
    const { authModalType, closeAuthModal, login, signup, isLoading } = useAuth();
    const [isLoginMode, setIsLoginMode] = useState(() => authModalType !== 'signup');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const nameFieldRef = useRef<HTMLDivElement>(null);
    const [nameFieldHeight, setNameFieldHeight] = useState(60); // Approximate height: label (18px) + input (40px) + spacing (2px)

    const [formData, setFormData] = useState({
        firstName: '',
        email: '',
        password: ''
    });

    // Measure name field height once when component mounts
    useEffect(() => {
        if (nameFieldRef.current) {
            // Set to auto to measure, then use the measured value
            const tempHeight = nameFieldRef.current.scrollHeight;
            if (tempHeight > 0) {
                setNameFieldHeight(tempHeight);
            }
        }
    }, []);

    // Sync mode with authModalType
    React.useEffect(() => {
        if (authModalType === 'login') setIsLoginMode(true);
        if (authModalType === 'signup') setIsLoginMode(false);
        setError(null);
        setFormData({ firstName: '', email: '', password: '' });
    }, [authModalType]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            if (isLoginMode) {
                await login({ email: formData.email, password: formData.password });
            } else {
                await signup({
                    firstName: formData.firstName,
                    email: formData.email,
                    password: formData.password
                });
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setError(null);
    };

    return (
        <AnimatePresence mode="wait">
            {authModalType && (
                <motion.div
                    key="auth-modal"
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    style={{
                        transform: 'translateZ(0)',
                        willChange: 'transform, opacity'
                    }}
                >
                    {/* Backdrop - use opacity instead of blur for mobile performance */}
                    <motion.div
                        className="absolute inset-0 bg-black/50"
                        variants={backdropVariants}
                        onClick={closeAuthModal}
                        transition={{ duration: 0.2 }}
                        style={{ transform: 'translateZ(0)' }}
                    />

                    {/* Modal */}
                    <motion.div
                        className="relative w-full max-w-[360px] bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] overflow-hidden"
                        variants={modalVariants}
                        style={{ transform: 'translateZ(0)', willChange: 'transform, opacity' }}
                    >
                        {/* Close button */}
                        <button
                            onClick={closeAuthModal}
                            className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors z-10"
                        >
                            <X size={18} />
                        </button>

                        {/* Header */}
                        <motion.div
                            className="px-6 pt-6 pb-4"
                            layout
                            transition={{ duration: 0.2, ease: [0.4, 0.0, 0.2, 1] }}
                        >
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={isLoginMode ? 'login' : 'signup'}
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 4 }}
                                    transition={{ duration: 0.15, ease: [0.4, 0.0, 0.2, 1] }}
                                >
                                    <h2 className="text-xl font-bold text-slate-800">
                                        {isLoginMode ? 'Welcome back' : 'Create account'}
                                    </h2>
                                    <p className="text-sm text-slate-500 mt-1">
                                        {isLoginMode
                                            ? 'Sign in to continue to Zeta'
                                            : 'Get started with Zeta for free'}
                                    </p>
                                </motion.div>
                            </AnimatePresence>
                        </motion.div>

                        {/* Form */}
                        <motion.form
                            onSubmit={handleSubmit}
                            className="px-6 pb-6"
                            layout
                            transition={{ duration: 0.2, ease: [0.4, 0.0, 0.2, 1] }}
                        >
                            <div className="space-y-3">
                                {/* Name field - Always rendered but conditionally visible */}
                                <motion.div
                                    ref={nameFieldRef}
                                    initial={false}
                                    animate={{
                                        opacity: isLoginMode ? 0 : 1,
                                        height: isLoginMode ? 0 : nameFieldHeight,
                                        marginBottom: isLoginMode ? 0 : 12,
                                    }}
                                    transition={{
                                        duration: 0.2,
                                        ease: [0.4, 0.0, 0.2, 1]
                                    }}
                                    style={{
                                        overflow: 'hidden',
                                        pointerEvents: isLoginMode ? 'none' : 'auto'
                                    }}
                                >
                                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        placeholder="Your first name"
                                        className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                        required={!isLoginMode}
                                        tabIndex={isLoginMode ? -1 : 0}
                                        pattern="[A-Za-z]+"
                                        title="First name only, no spaces"
                                    />
                                </motion.div>

                                {/* Email field */}
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="you@example.com"
                                        className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                        required
                                    />
                                </div>

                                {/* Password field */}
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            placeholder="••••••••"
                                            className="w-full px-3 py-2 pr-10 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                            required
                                            minLength={6}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Error message */}
                            <AnimatePresence>
                                {error && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -5 }}
                                        transition={{ duration: 0.2 }}
                                        className="text-xs text-red-500 mt-3"
                                    >
                                        {error}
                                    </motion.p>
                                )}
                            </AnimatePresence>

                            {/* Submit button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full mt-4 py-2.5 px-4 text-sm font-medium text-white bg-slate-800 hover:bg-slate-700 disabled:bg-slate-400 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.12)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        <span>{isLoginMode ? 'Signing in...' : 'Creating account...'}</span>
                                    </>
                                ) : (
                                    <span>{isLoginMode ? 'Sign in' : 'Create account'}</span>
                                )}
                            </button>

                            {/* Toggle mode */}
                            <p className="text-center text-xs text-slate-500 mt-4">
                                {isLoginMode ? "Don't have an account? " : "Already have an account? "}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsLoginMode(!isLoginMode);
                                        setError(null);
                                    }}
                                    className="text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    {isLoginMode ? 'Sign up' : 'Sign in'}
                                </button>
                            </p>
                        </motion.form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
