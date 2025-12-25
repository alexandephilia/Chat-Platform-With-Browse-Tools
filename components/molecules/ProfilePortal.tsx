import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Moon, 
    Sun, 
    LogOut, 
    MessageSquareText, 
    ChevronRight,
    Sparkles,
    UserCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface ProfilePortalProps {
    isOpen: boolean;
    onClose: () => void;
    isDarkMode: boolean;
    onToggleTheme: () => void;
    onOpenInstructions: () => void;
}

export const ProfilePortal: React.FC<ProfilePortalProps> = ({ 
    isOpen, 
    onClose, 
    isDarkMode, 
    onToggleTheme,
    onOpenInstructions
}) => {
    const { user, logout } = useAuth();

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-transparent"
                    />

                    {/* Compact Portal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
                        className="fixed left-4 top-16 w-64 z-50 bg-[var(--color-portal)] border border-[var(--color-border)] rounded-2xl shadow-xl overflow-hidden"
                    >
                        {/* Compact User Info */}
                        <div className="px-4 py-3 border-b border-[var(--color-border-light)] bg-slate-50/50 dark:bg-slate-900/50">
                            <h3 className="text-xs font-bold text-[var(--color-text)] truncate">
                                {user?.firstName || 'Personal'}
                            </h3>
                            <p className="text-[10px] text-[var(--color-text-secondary)] truncate">
                                {user?.email}
                            </p>
                        </div>

                        {/* Menu Items */}
                        <div className="p-1.5">
                            {/* Theme Toggle */}
                            <button 
                                onClick={() => {
                                    onToggleTheme();
                                }}
                                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[var(--color-primary)]/5 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="text-[var(--color-text-secondary)] group-hover:text-[var(--color-primary)] transition-colors">
                                        {isDarkMode ? <Moon size={16} /> : <Sun size={16} />}
                                    </div>
                                    <span className="text-sm font-medium text-[var(--color-text)]">
                                        {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                                    </span>
                                </div>
                                <div className="text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] opacity-0 group-hover:opacity-100 transition-all">
                                    <ChevronRight size={14} />
                                </div>
                            </button>

                            {/* Custom Instructions Trigger */}
                            <button 
                                onClick={() => {
                                    onOpenInstructions();
                                    onClose();
                                }}
                                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[var(--color-primary)]/5 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="text-[var(--color-text-secondary)] group-hover:text-amber-500 transition-colors">
                                        <Sparkles size={16} />
                                    </div>
                                    <span className="text-sm font-medium text-[var(--color-text)] text-left">
                                        Instructions
                                    </span>
                                </div>
                                <div className="text-[var(--color-text-muted)] group-hover:text-amber-500 opacity-0 group-hover:opacity-100 transition-all">
                                    <ChevronRight size={14} />
                                </div>
                            </button>

                            <div className="my-1 border-t border-[var(--color-border-light)]" />

                            {/* Sign Out */}
                            <button 
                                onClick={() => {
                                    logout();
                                    onClose();
                                }}
                                className="w-full flex items-center gap-3 p-2.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors group"
                            >
                                <LogOut size={16} />
                                <span className="text-sm font-semibold">Sign Out</span>
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
