import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle, X } from 'lucide-react';
import React, { createContext, useCallback, useContext, useState } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within ToastProvider');
    return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    }, []);

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Toast Container - Bottom Center */}
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-1.5 items-center">
                <AnimatePresence>
                    {toasts.map(toast => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, y: 30, scale: 0.9, filter: 'blur(6px)' }}
                            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, y: 10, scale: 0.95, filter: 'blur(4px)' }}
                            transition={{ type: 'spring', bounce: 0.25, duration: 0.35 }}
                            className={`
                                flex items-center gap-2 px-2.5 py-1.5 rounded-lg shadow-md backdrop-blur-md border
                                ${toast.type === 'error' ? 'bg-red-500/90 border-red-400/50 text-white' : ''}
                                ${toast.type === 'success' ? 'bg-green-500/90 border-green-400/50 text-white' : ''}
                                ${toast.type === 'info' ? 'bg-slate-800/90 border-slate-700/50 text-white' : ''}
                            `}
                        >
                            {toast.type === 'error' && <AlertCircle size={12} />}
                            {toast.type === 'success' && <CheckCircle size={12} />}
                            <span className="text-[11px] font-medium">{toast.message}</span>
                            <button onClick={() => removeToast(toast.id)} className="ml-1 hover:opacity-70">
                                <X size={12} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};
