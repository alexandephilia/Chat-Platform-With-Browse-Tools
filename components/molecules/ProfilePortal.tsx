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
                        className="fixed left-4 top-16 w-60 z-50 backdrop-blur-xl rounded-xl border border-slate-200/60 shadow-[0_8px_32px_rgba(0,0,0,0.12),0_4px_8px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] overflow-hidden"
                        style={{
                            background: 'rgb(250, 250, 250)',
                            transform: 'translateZ(0)',
                            willChange: 'transform, opacity'
                        }}
                    >
                        {/* Header Area */}
                        <div className="px-3 py-2 mb-0.5">
                            <span className="text-[11px] font-bold text-slate-400 tracking-wider">
                                Account
                            </span>
                        </div>

                        {/* Menu Items */}
                        <div className="p-1 space-y-0.5">
                            {/* User branding as a non-clickable item or special section */}
                            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-slate-500 shadow-[inset_0_1px_1px_rgba(255,255,255,1),0_1px_2px_rgba(0,0,0,0.03),0_0_0_1px_rgba(0,0,0,0.02)] border border-transparent">
                                <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center shrink-0 shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] overflow-hidden">
                                     <UserCircle size={14} className="text-slate-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-[11px] font-medium text-slate-700 truncate">
                                        {user?.firstName || 'Personal'}
                                    </h3>
                                    <p className="text-[8px] text-slate-400 truncate">
                                        {user?.email}
                                    </p>
                                </div>
                            </div>

                            <div className="h-px bg-slate-200/40 my-1 mx-1.5" />

                            {/* Theme Toggle */}
                            <button 
                                onClick={() => {
                                    onToggleTheme();
                                }}
                                className={`
                                    w-full flex items-center justify-between px-2 py-1.5 rounded-lg
                                    transition-all duration-300 group/item relative
                                    text-slate-500 hover:bg-slate-50/80 hover:text-blue-600
                                    shadow-[inset_0_1px_1px_rgba(255,255,255,1),0_1px_2px_rgba(0,0,0,0.03),0_0_0_1px_rgba(0,0,0,0.02)]
                                `}
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full transition-all duration-300 relative flex items-center justify-center shrink-0 shadow-[inset_0_2px_3px_rgba(0,0,0,0.08),0_1px_0_rgba(255,255,255,0.8)] bg-slate-100">
                                        <div className="absolute w-3.5 h-3.5 rounded-full transition-all duration-300 transform flex items-center justify-center bg-gradient-to-b from-white to-slate-50 shadow-[0_2px_4px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,1)]">
                                            {isDarkMode ? <Moon size={11} /> : <Sun size={11} />}
                                        </div>
                                    </div>
                                    <span className="text-[11px] font-medium">
                                        {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                                    </span>
                                </div>
                                <ChevronRight size={10} className="text-slate-300 group-hover/item:text-blue-400 transition-colors" />
                            </button>

                            {/* Custom Instructions Trigger */}
                            <button 
                                onClick={() => {
                                    onOpenInstructions();
                                    onClose();
                                }}
                                className={`
                                    w-full flex items-center justify-between px-2 py-1.5 rounded-lg
                                    transition-all duration-300 group/item relative
                                    text-slate-500 hover:bg-slate-50/80 hover:text-amber-500
                                    shadow-[inset_0_1px_1px_rgba(255,255,255,1),0_1px_2px_rgba(0,0,0,0.03),0_0_0_1px_rgba(0,0,0,0.02)]
                                `}
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full transition-all duration-300 relative flex items-center justify-center shrink-0 shadow-[inset_0_2px_3px_rgba(0,0,0,0.08),0_1px_0_rgba(255,255,255,0.8)] bg-slate-100">
                                        <div className="absolute w-3.5 h-3.5 rounded-full transition-all duration-300 transform flex items-center justify-center bg-gradient-to-b from-white to-slate-50 shadow-[0_2px_4px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,1)] text-amber-500">
                                            <Sparkles size={11} />
                                        </div>
                                    </div>
                                    <span className="text-[11px] font-medium text-left">
                                        Instructions
                                    </span>
                                </div>
                                <ChevronRight size={10} className="text-slate-300 group-hover/item:text-amber-400 transition-colors" />
                            </button>

                            <div className="h-px bg-slate-200/40 my-1 mx-1.5" />

                            {/* Sign Out */}
                            <button 
                                onClick={() => {
                                    logout();
                                    onClose();
                                }}
                                className={`
                                    w-full flex items-center gap-2 px-2 py-1.5 rounded-lg
                                    transition-all duration-300 group/item relative
                                    text-rose-500 hover:bg-rose-50/50
                                    shadow-[inset_0_1px_1px_rgba(255,255,255,1),0_1px_2px_rgba(0,0,0,0.03),0_0_0_1px_rgba(0,0,0,0.02)]
                                `}
                            >
                                <div className="w-5 h-5 rounded-full transition-all duration-300 relative flex items-center justify-center shrink-0 shadow-[inset_0_2px_3px_rgba(0,0,0,0.08),0_1px_0_rgba(255,255,255,0.8)] bg-rose-50">
                                     <LogOut size={11} />
                                </div>
                                <span className="text-[11px] font-bold">Sign Out</span>
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
