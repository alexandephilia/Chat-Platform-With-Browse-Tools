import { AnimatePresence, motion } from 'framer-motion';
import {
    ChevronRight,
    LogOut,
    Moon,
    Sun,
    UserCircle
} from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ProfileEditModal } from './ProfileEditModal';

const AtomOutline = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
        <path fill="currentColor" fillRule="evenodd" d="M13.462 4.047c1.203.822 2.4 1.812 3.54 2.951a24.928 24.928 0 0 1 2.951 3.54c.701-1.377 1.123-2.682 1.253-3.813c.165-1.427-.138-2.482-.794-3.137c-.655-.656-1.71-.96-3.137-.794c-1.131.13-2.436.552-3.813 1.253ZM20.869 12c1.005-1.765 1.645-3.524 1.828-5.103c.195-1.69-.13-3.275-1.224-4.37c-1.095-1.095-2.68-1.419-4.37-1.224c-1.58.183-3.338.823-5.103 1.828c-1.765-1.005-3.523-1.645-5.103-1.827c-1.69-.195-3.275.128-4.37 1.223c-1.094 1.095-1.418 2.68-1.223 4.37c.182 1.58.822 3.338 1.828 5.103c-1.006 1.765-1.646 3.523-1.828 5.103c-.195 1.69.129 3.274 1.224 4.37c1.095 1.094 2.679 1.418 4.37 1.223c1.579-.182 3.337-.822 5.102-1.828c1.765 1.006 3.523 1.646 5.103 1.828c1.69.195 3.275-.129 4.37-1.224c1.095-1.095 1.418-2.679 1.223-4.37c-.182-1.579-.822-3.337-1.827-5.102Zm-1.75 0a23 23 0 0 0-3.178-3.941A23 23 0 0 0 12 4.88a23 23 0 0 0-3.94 3.18A22.998 22.998 0 0 0 4.88 12a23.004 23.004 0 0 0 3.18 3.942A23 23 0 0 0 12 19.119a22.995 22.995 0 0 0 3.941-3.179A23 23 0 0 0 19.12 12Zm-5.657 7.953a24.937 24.937 0 0 0 3.54-2.952a24.937 24.937 0 0 0 2.951-3.54c.701 1.378 1.123 2.682 1.253 3.814c.165 1.427-.138 2.481-.794 3.137c-.656.655-1.71.959-3.137.794c-1.131-.13-2.436-.552-3.813-1.253Zm-2.924 0A24.928 24.928 0 0 1 6.998 17a24.933 24.933 0 0 1-2.951-3.54c-.7 1.378-1.122 2.682-1.253 3.814c-.164 1.427.139 2.481.794 3.137c.656.655 1.71.958 3.137.794c1.132-.13 2.436-.552 3.813-1.253Zm-6.491-9.415a24.935 24.935 0 0 1 2.952-3.54a24.933 24.933 0 0 1 3.54-2.951C9.16 3.346 7.856 2.924 6.724 2.794c-1.427-.165-2.481.138-3.137.794c-.655.655-.959 1.71-.794 3.137c.13 1.131.552 2.436 1.253 3.813ZM12 10.25a1.75 1.75 0 1 0 0 3.5a1.75 1.75 0 0 0 0-3.5ZM8.75 12a3.25 3.25 0 1 1 6.5 0a3.25 3.25 0 0 1-6.5 0Z" clipRule="evenodd"></path>
    </svg>
);

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
    const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);

    // Prevent clicks inside the menu from closing it
    const handleMenuClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        e.stopPropagation();
    }, []);

    const handleOpenProfileEdit = useCallback(() => {
        onClose(); // Close the portal first
        setTimeout(() => setIsProfileEditOpen(true), 100); // Open profile modal after portal closes
    }, [onClose]);

    const portalContent = (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[10000]">
                    {/* Backdrop - captures clicks to close */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        onTouchEnd={onClose}
                        className="fixed inset-0 bg-black/10"
                    />

                    {/* Compact Portal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
                        onClick={handleMenuClick}
                        onTouchEnd={handleMenuClick}
                        className="fixed z-[10001] backdrop-blur-xl rounded-xl border border-slate-200/60 shadow-[0_8px_32px_rgba(0,0,0,0.12),0_4px_8px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] overflow-hidden w-48 left-4 top-14 sm:top-16"
                        style={{
                            background: 'rgb(250, 250, 250)',
                            willChange: 'transform, opacity'
                        }}
                    >
                        {/* Header Area */}
                        <div className="px-3 py-2 mb-0.5">
                            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                                Account
                            </span>
                        </div>

                        {/* Menu Items */}
                        <div className="p-1 space-y-0.5">
                            {/* User branding - now clickable */}
                            <button
                                onClick={handleOpenProfileEdit}
                                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-slate-500 shadow-[inset_0_2px_4px_rgba(0,0,0,0.04),inset_0_1px_1px_rgba(0,0,0,0.02),0_1px_0_rgba(255,255,255,0.8)] border border-transparent hover:bg-slate-50/80 hover:border-slate-200/40 transition-all duration-200 group/profile"
                            >
                                <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center shrink-0 shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] overflow-hidden group-hover/profile:bg-blue-50 transition-colors">
                                    {user?.avatar ? (
                                        <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <UserCircle size={14} className="text-slate-400 group-hover/profile:text-blue-400 transition-colors" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 text-left">
                                    <h3 className="text-[11px] font-medium text-slate-700 truncate group-hover/profile:text-blue-600 transition-colors">
                                        {user?.firstName || 'Personal'}
                                    </h3>
                                    <p className="text-[8px] text-slate-400 truncate">
                                        {user?.email}
                                    </p>
                                </div>
                                <ChevronRight size={10} className="text-slate-300 group-hover/profile:text-blue-400 transition-colors" />
                            </button>

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
                                    text-slate-500 hover:bg-slate-50/80
                                    shadow-[inset_0_1px_1px_rgba(255,255,255,1),0_1px_2px_rgba(0,0,0,0.03),0_0_0_1px_rgba(0,0,0,0.02)]
                                `}
                                style={{ ['--hover-color' as string]: 'rgb(36 89 133 / 95%)' }}
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full transition-all duration-300 relative flex items-center justify-center shrink-0 shadow-[inset_0_2px_3px_rgba(0,0,0,0.08),0_1px_0_rgba(255,255,255,0.8)] bg-slate-100">
                                        <div className="absolute w-3.5 h-3.5 rounded-full transition-all duration-300 transform flex items-center justify-center bg-gradient-to-b from-white to-slate-50 shadow-[0_2px_4px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,1)]" style={{ color: 'rgb(36 89 133 / 95%)' }}>
                                            <AtomOutline className="w-[11px] h-[11px]" />

                                        </div>
                                    </div>
                                    <span className="text-[11px] font-medium text-left transition-colors group-hover/item:text-[rgb(36,89,133)]">
                                        Instructions
                                    </span>
                                </div>
                                <ChevronRight size={10} className="text-slate-300 transition-colors group-hover/item:text-[rgb(36,89,133)]" />
                            </button>

                            <div className="h-px bg-slate-200/40 my-1 mx-1.5" />

                            {/* Sign Out */}
                            <button
                                onClick={() => {
                                    logout();
                                    onClose();
                                }}
                                className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] font-bold transition-all bg-gradient-to-b from-red-50 to-red-100/80 border border-red-200/60 shadow-[0_2px_4px_rgba(239,68,68,0.15),0_1px_2px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.8)] text-red-600 hover:text-red-700 hover:shadow-[0_3px_6px_rgba(239,68,68,0.2),0_1px_2px_rgba(0,0,0,0.06)]"
                            >
                                <LogOut size={12} className="text-red-500" />
                                <span>Sign Out</span>
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    return (
        <>
            {createPortal(portalContent, document.body)}
            <ProfileEditModal
                isOpen={isProfileEditOpen}
                onClose={() => setIsProfileEditOpen(false)}
            />
        </>
    );
};
