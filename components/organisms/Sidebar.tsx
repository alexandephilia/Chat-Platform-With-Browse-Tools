import { AnimatePresence, motion, Variants } from "framer-motion";
import { ChevronDown, LogOut, MoreHorizontal, Search, Trash2, TrendingUp, X } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { useAuth } from "../../contexts/AuthContext";
import { ClayInput } from "../atoms/ClayInput";
import { BellBingLinear, ExpressionlessSquareLinear } from "../atoms/Icons";
import { UserAvatar } from "../atoms/UserAvatar";
import { ClayPromoCard } from "../molecules/ClayPromoCard";

// Chat bubble icon for history items
const ChatRoundLineLinear: React.FC<{ size?: number; className?: string }> = ({ size = 18, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" className={className}>
        <g fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2S2 6.477 2 12c0 1.6.376 3.112 1.043 4.453c.178.356.237.763.134 1.148l-.595 2.226a1.3 1.3 0 0 0 1.591 1.591l2.226-.595a1.634 1.634 0 0 1 1.149.133A9.958 9.958 0 0 0 12 22Z"></path>
            <path strokeLinecap="round" d="M8 10.5h8M8 14h5.5"></path>
        </g>
    </svg>
);

const UfoIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" className={className}>
        <g fill="none">
            <path stroke="currentColor" strokeWidth="1.5" d="M17 8.21c2.989.723 5 2.071 5 3.616C22 14.131 17.523 16 12 16S2 14.13 2 11.826c0-1.545 2.011-2.893 5-3.615" />
            <path stroke="currentColor" strokeWidth="1.5" d="M7 8.729A4.729 4.729 0 0 1 11.729 4h.542A4.729 4.729 0 0 1 17 8.729c0 .177-.054.35-.2.451c-.414.288-1.61.82-4.8.82c-3.19 0-4.386-.532-4.8-.82c-.146-.1-.2-.274-.2-.451Z" />
            <path stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" d="M12 16v3m-6.5-3.5l-1 2m14-2l1 2" />
            <circle cx="12" cy="13" r="1" fill="currentColor" />
            <circle cx="7" cy="12" r="1" fill="currentColor" />
            <circle cx="17" cy="12" r="1" fill="currentColor" />
        </g>
    </svg>
);

const Logout2Linear: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
        <g fill="none" stroke="#000000" strokeLinecap="round" strokeWidth="1.5">
            <path d="M9.002 7c.012-2.175.109-3.353.877-4.121C10.758 2 12.172 2 15 2h1c2.829 0 4.243 0 5.122.879C22 3.757 22 5.172 22 8v8c0 2.828 0 4.243-.878 5.121C20.242 22 18.829 22 16 22h-1c-2.828 0-4.242 0-5.121-.879c-.768-.768-.865-1.946-.877-4.121"></path>
            <path strokeLinejoin="round" d="M15 12H2m0 0l3.5-3M2 12l3.5 3"></path>
        </g>
    </svg>
);

export interface ChatHistoryItem {
    id: string;
    title: string;
    timestamp: Date;
    messageCount: number;
    isNew?: boolean; // Marks the newest chat with a completed AI response
}

// Unified Animation System for Sidebar Transitions
const ANIMATION_CONFIG = {
    duration: { fast: 0.2, medium: 0.4, slow: 0.6 },
    easing: {
        smooth: [0.16, 1, 0.3, 1], // (dramatic deceleration for that "apple" feel)
        spring: { type: "spring", stiffness: 200, damping: 30, mass: 0.8 },
        exit: { type: "tween", ease: "circIn", duration: 0.25 } // (getting out of the way fast)
    },
    stagger: { container: 0.1, elements: 0.05, text: 0.03 } // (intentional delays to guide the eye)
};

// Synchronized animation variants for all elements
const sidebarVariants: Variants = {
    minimized: {
        transition: {
            duration: ANIMATION_CONFIG.duration.medium,
            ease: ANIMATION_CONFIG.easing.smooth,
            staggerChildren: ANIMATION_CONFIG.stagger.container
        }
    },
    expanded: {
        transition: {
            duration: ANIMATION_CONFIG.duration.medium,
            ease: ANIMATION_CONFIG.easing.smooth,
            staggerChildren: ANIMATION_CONFIG.stagger.container,
            delayChildren: 0.02
        }
    }
};

const containerVariants: Variants = {
    minimized: {
        transition: {
            staggerChildren: ANIMATION_CONFIG.stagger.elements,
            delayChildren: 0.05
        }
    },
    expanded: {
        transition: {
            staggerChildren: ANIMATION_CONFIG.stagger.elements,
            delayChildren: 0.02
        }
    }
};

const elementVariants: Variants = {
    minimized: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: ANIMATION_CONFIG.duration.fast,
            ease: ANIMATION_CONFIG.easing.smooth
        }
    },
    expanded: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: ANIMATION_CONFIG.duration.fast,
            ease: ANIMATION_CONFIG.easing.smooth
        }
    }
};

const textVariants: Variants = {
    minimized: {
        opacity: 1,
        x: 0,
        filter: 'blur(0px)',
        scale: 1,
        transition: {
            duration: ANIMATION_CONFIG.duration.fast,
            ease: ANIMATION_CONFIG.easing.smooth
        }
    },
    expanded: {
        opacity: 1,
        x: 0,
        filter: 'blur(0px)',
        scale: 1,
        transition: {
            duration: ANIMATION_CONFIG.duration.medium,
            ease: ANIMATION_CONFIG.easing.smooth,
            delay: 0.1
        }
    }
};

const iconVariants: Variants = {
    minimized: {
        scale: 1,
        transition: {
            duration: ANIMATION_CONFIG.duration.fast,
            ease: ANIMATION_CONFIG.easing.smooth
        }
    },
    expanded: {
        scale: 1,
        transition: {
            duration: ANIMATION_CONFIG.duration.fast,
            ease: ANIMATION_CONFIG.easing.smooth
        }
    }
};

const searchPopVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8, y: -10 },
    visible: { opacity: 1, scale: 1, y: 0, transition: ANIMATION_CONFIG.easing.spring }
};

const menuContainerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.15 } }
};

const menuItemVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 150, damping: 20 } }
};

const itemTextVariants: Variants = {
    hidden: { opacity: 0, x: -10, filter: 'blur(4px)' },
    visible: { opacity: 1, x: 0, filter: 'blur(0px)', transition: { duration: 0.25, delay: 0.2 } },
    exit: { opacity: 0, x: -50, filter: 'blur(6px)', transition: { duration: 0.01 } }
};

interface SidebarProps {
    isOpen: boolean;
    isMinimized?: boolean;
    onClose?: () => void;
    onNewChat?: () => void;
    onSelectChat?: (chatId: string) => void;
    onDeleteChat?: (chatId: string) => void;
    chatHistory?: ChatHistoryItem[];
    activeChatId?: string;
    onOpenProfile?: () => void;
}

const groupChatsByTimeline = (chats: ChatHistoryItem[]): Record<string, ChatHistoryItem[]> => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const groups: Record<string, ChatHistoryItem[]> = { 'Today': [], 'Yesterday': [], 'Last 7 days': [], 'Last 30 days': [], 'Older': [] };

    chats.forEach(chat => {
        const chatDate = new Date(chat.timestamp);
        if (chatDate >= today) groups['Today'].push(chat);
        else if (chatDate >= yesterday) groups['Yesterday'].push(chat);
        else if (chatDate >= last7Days) groups['Last 7 days'].push(chat);
        else if (chatDate >= last30Days) groups['Last 30 days'].push(chat);
        else groups['Older'].push(chat);
    });

    Object.keys(groups).forEach(key => { if (groups[key].length === 0) delete groups[key]; });
    return groups;
};

const ChatHistoryItemComponent: React.FC<{
    chat: ChatHistoryItem;
    isActive: boolean;
    isMinimized: boolean;
    isNew?: boolean;
    onSelect: () => void;
    onDelete: () => void;
}> = React.memo(({ chat, isActive, isMinimized, isNew, onSelect, onDelete }) => {
    const [showMenu, setShowMenu] = useState(false);
    const menuButtonRef = useRef<HTMLButtonElement>(null);
    const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
    const touchStartTime = useRef(0);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        touchStartTime.current = Date.now();
    }, []);

    const handleTouchEnd = useCallback((e: React.TouchEvent) => {
        const touchDuration = Date.now() - touchStartTime.current;
        if (touchDuration > 300) {
            e.preventDefault();
            return;
        }
    }, []);

    const handleMenuClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (menuButtonRef.current) {
            const rect = menuButtonRef.current.getBoundingClientRect();
            setMenuPosition({
                top: rect.bottom + 4,
                right: window.innerWidth - rect.right
            });
        }
        setShowMenu(prev => !prev);
    }, []);

    const handleDeleteClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setShowMenu(false);
        setTimeout(onDelete, 50);
    }, [onDelete]);

    const closeMenu = useCallback(() => setShowMenu(false), []);

    // Close menu when clicking outside
    React.useEffect(() => {
        if (!showMenu) return;

        const timer = setTimeout(() => {
            const handleClickOutside = (e: MouseEvent) => {
                const target = e.target as HTMLElement;
                if (target.closest('[data-desktop-delete-menu]')) return;
                if (menuButtonRef.current?.contains(target)) return;
                setShowMenu(false);
            };
            document.addEventListener('click', handleClickOutside, true);

            return () => {
                document.removeEventListener('click', handleClickOutside, true);
            };
        }, 100);

        return () => clearTimeout(timer);
    }, [showMenu]);

    return (
        <div className="relative group">
            <button
                onClick={onSelect}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                title={isMinimized ? chat.title : undefined}
                className={`w-full flex items-center rounded-xl text-sm transition-colors duration-150 ${isMinimized ? "justify-center px-1.5 py-2.5" : "justify-start px-3 py-2"} ${isActive ? "bg-gradient-to-br from-white via-white to-slate-50 text-slate-800 shadow-[0_1px_0px_rgba(0,0,0,0.1),0_3px_6px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] border border-slate-200/60" : isNew ? "text-blue-600 hover:bg-blue-50/80" : "text-slate-600 hover:bg-white/80 hover:text-slate-700"}`}
                style={{ transform: 'translateZ(0)' }}
            >
                {isMinimized ? (
                    <div className="relative">
                        <ChatRoundLineLinear size={18} className={isNew ? "text-blue-500" : "text-slate-400"} />
                        {isNew && (
                            <span
                                className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 rounded-full"
                                style={{
                                    background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #2563eb 100%)',
                                    boxShadow: '0 2px 4px rgba(59, 130, 246, 0.5), 0 1px 2px rgba(59, 130, 246, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.4)'
                                }}
                            />
                        )}
                    </div>
                ) : (
                    <>
                        <div className="relative mr-2.5 flex-shrink-0">
                            <ChatRoundLineLinear size={18} className={isNew ? "text-blue-500" : "text-slate-400"} />
                            {isNew && (
                                <span
                                    className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
                                    style={{
                                        background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #2563eb 100%)',
                                        boxShadow: '0 2px 4px rgba(59, 130, 246, 0.5), 0 1px 2px rgba(59, 130, 246, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.4)'
                                    }}
                                />
                            )}
                        </div>
                        <span className={`truncate text-[13px] font-medium flex-1 text-left ${isNew ? "text-blue-600" : ""}`}>
                            {chat.title}
                        </span>
                    </>
                )}
            </button>
            {!isMinimized && (
                <div className="absolute -right-1 -top-1 opacity-0 group-hover:opacity-70 transition-all duration-200 z-10">
                    <button
                        ref={menuButtonRef}
                        onClick={handleMenuClick}
                        className="p-1 rounded-lg bg-white/70 backdrop-blur-sm shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-slate-200/40 text-slate-400 hover:text-slate-600 hover:bg-white/90 transition-all duration-150"
                    >
                        <MoreHorizontal size={12} />
                    </button>
                </div>
            )}
            {showMenu && ReactDOM.createPortal(
                <>
                    <div
                        className="fixed inset-0"
                        style={{ zIndex: 99998 }}
                        onClick={closeMenu}
                    />
                    <div
                        data-desktop-delete-menu
                        style={{
                            position: 'fixed',
                            top: menuPosition.top,
                            right: menuPosition.right,
                            zIndex: 99999,
                            transform: 'translateZ(0)'
                        }}
                        className="bg-white rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.15),0_2px_4px_rgba(0,0,0,0.08)] border border-slate-200/40 overflow-hidden"
                    >
                        <button
                            onClick={handleDeleteClick}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50/80 active:bg-red-100 transition-colors duration-150"
                        >
                            <Trash2 size={14} /><span>Delete</span>
                        </button>
                    </div>
                </>,
                document.body
            )}
        </div>
    );
});


const MobileChatHistoryItemComponent: React.FC<{
    chat: ChatHistoryItem;
    isActive: boolean;
    isNew?: boolean;
    onSelect: () => void;
    onDelete: () => void;
}> = React.memo(({ chat, isActive, isNew, onSelect, onDelete }) => {
    const [showMenu, setShowMenu] = useState(false);
    const menuButtonRef = useRef<HTMLButtonElement>(null);
    const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
    const touchStartTime = useRef(0);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        touchStartTime.current = Date.now();
    }, []);

    const handleTouchEnd = useCallback((e: React.TouchEvent) => {
        const touchDuration = Date.now() - touchStartTime.current;
        if (touchDuration > 300) {
            e.preventDefault();
            return;
        }
    }, []);

    const handleMenuClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (menuButtonRef.current) {
            const rect = menuButtonRef.current.getBoundingClientRect();
            setMenuPosition({
                top: rect.bottom + 4,
                right: window.innerWidth - rect.right
            });
        }
        setShowMenu(prev => !prev);
    }, []);

    const handleDeleteClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setShowMenu(false);
        setTimeout(onDelete, 50);
    }, [onDelete]);

    const closeMenu = useCallback(() => setShowMenu(false), []);

    useEffect(() => {
        if (!showMenu) return;

        const timer = setTimeout(() => {
            const handleClickOutside = (e: MouseEvent | TouchEvent) => {
                const target = e.target as HTMLElement;
                if (target.closest('[data-delete-menu]')) return;
                if (menuButtonRef.current?.contains(target)) return;
                setShowMenu(false);
            };
            document.addEventListener('click', handleClickOutside, true);
            document.addEventListener('touchend', handleClickOutside, true);

            return () => {
                document.removeEventListener('click', handleClickOutside, true);
                document.removeEventListener('touchend', handleClickOutside, true);
            };
        }, 100);

        return () => clearTimeout(timer);
    }, [showMenu]);

    return (
        <div className="relative group">
            <button
                onClick={onSelect}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors duration-150 ${isActive ? "bg-gradient-to-br from-white via-white to-slate-50 text-slate-800 shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-slate-200/60" : isNew ? "text-blue-600 active:bg-blue-50/80" : "text-slate-600 active:bg-white/80"}`}
                style={{ transform: 'translateZ(0)' }}
            >
                <div className="relative flex-shrink-0">
                    <ChatRoundLineLinear size={18} className={isNew ? "text-blue-500" : "text-slate-400"} />
                    {isNew && (
                        <span
                            className="absolute -top-1 -right-1 w-2 h-2 rounded-full"
                            style={{
                                background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #2563eb 100%)',
                                boxShadow: '0 2px 4px rgba(59, 130, 246, 0.5), 0 1px 2px rgba(59, 130, 246, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.4)'
                            }}
                        />
                    )}
                </div>
                <span className={`truncate text-left flex-1 font-medium ${isNew ? "text-blue-600" : ""}`}>{chat.title}</span>
            </button>
            <div className="absolute -right-1 -top-1 z-10">
                <button
                    ref={menuButtonRef}
                    onClick={handleMenuClick}
                    onTouchEnd={handleMenuClick}
                    className="p-1.5 rounded-lg bg-white/20 backdrop-blur-md shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-slate-200/20 text-slate-400 active:scale-95 active:bg-white/40 transition-all duration-150"
                    style={{ transform: 'translateZ(0)' }}
                >
                    <MoreHorizontal size={14} />
                </button>
            </div>
            {showMenu && ReactDOM.createPortal(
                <>
                    <div
                        className="fixed inset-0"
                        style={{ zIndex: 9998 }}
                        onClick={closeMenu}
                        onTouchEnd={closeMenu}
                    />
                    <div
                        data-delete-menu
                        style={{
                            position: 'fixed',
                            top: menuPosition.top,
                            right: menuPosition.right,
                            zIndex: 9999,
                            transform: 'translateZ(0)'
                        }}
                        className="bg-white rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.15),0_2px_4px_rgba(0,0,0,0.08)] border border-slate-200/40 overflow-hidden"
                    >
                        <button
                            onClick={handleDeleteClick}
                            onTouchEnd={handleDeleteClick}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 active:bg-red-100 transition-colors duration-150"
                        >
                            <Trash2 size={14} /><span>Delete</span>
                        </button>
                    </div>
                </>,
                document.body
            )}
        </div>
    );
});

const Sidebar: React.FC<SidebarProps> = ({ isOpen, isMinimized = false, onClose, onNewChat, onSelectChat, onDeleteChat, chatHistory = [], activeChatId, onOpenProfile }) => {
    const { isAuthenticated, user, logout, openLoginModal, openSignupModal } = useAuth();
    const navRef = useRef<HTMLDivElement>(null);
    const [canScrollUp, setCanScrollUp] = useState(false);
    const [canScrollDown, setCanScrollDown] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isChatButtonPressed, setIsChatButtonPressed] = useState(false);

    const handleScroll = useCallback(() => {
        if (navRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = navRef.current;
            setCanScrollUp(scrollTop > 2);
            setCanScrollDown(scrollTop < scrollHeight - clientHeight - 2);
        }
    }, []);

    React.useEffect(() => {
        handleScroll();
        const navEl = navRef.current;
        if (navEl) {
            const resizeObserver = new ResizeObserver(handleScroll);
            resizeObserver.observe(navEl);
            return () => resizeObserver.disconnect();
        }
    }, [handleScroll]);

    const filteredChats = useMemo(() => {
        if (!searchQuery.trim()) return chatHistory;
        return chatHistory.filter(chat => chat.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [chatHistory, searchQuery]);

    const groupedChats = useMemo(() => groupChatsByTimeline(filteredChats), [filteredChats]);

    const handleNewChat = () => {
        setIsChatButtonPressed(true);
        setTimeout(() => setIsChatButtonPressed(false), 150); // Reset after animation
        onNewChat?.();
        onClose?.();
    };

    return (
        <>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div key="mobile-sidebar" initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }} className="fixed inset-y-0 left-0 z-50 w-[240px] bg-[var(--color-bg-sidebar)] flex flex-col overflow-hidden shadow-xl md:hidden rounded-r-3xl" style={{ willChange: 'transform', transform: 'translateZ(0)', contain: 'layout style paint' }}>
                        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                {isAuthenticated ? (
                                    <div
                                        onClick={onOpenProfile}
                                        className="flex items-center gap-1 text-slate-500 cursor-pointer hover:text-slate-700 transition-colors"
                                    >
                                        <UserAvatar initials={user?.firstName?.charAt(0).toUpperCase() || 'U'} size="sm" />
                                        <span className="text-sm font-medium">{user?.firstName || 'Personal'}</span>
                                        <ChevronDown size={14} className="flex-shrink-0" />
                                    </div>
                                ) : (
                                    <div
                                        onClick={openLoginModal}
                                        className="flex items-center gap-1 text-slate-500 cursor-pointer hover:text-slate-700 transition-colors"
                                    >
                                        <UserAvatar initials="?" size="sm" />
                                        <span className="text-sm font-medium">Sign in</span>
                                    </div>
                                )}
                                <button className="relative text-slate-400 hover:text-slate-600 transition-colors">
                                    <BellBingLinear width={18} height={18} />
                                    <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 border border-white rounded-full translate-x-[2px] -translate-y-[2px]"></span>
                                </button>
                            </div>
                            <button onClick={onClose} className="p-2 -mr-2 hover:bg-slate-100 active:bg-slate-200 rounded-xl text-slate-500 transition-colors"><X size={20} /></button>
                        </div>
                        <div className="px-4 py-3">
                            <ClayInput icon={<Search size={16} />} placeholder="Search chats..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                        </div>
                        <div className="px-4 pb-2">
                            <button onClick={handleNewChat} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 bg-gradient-to-br from-white via-white to-slate-50 shadow-[0_4px_3px_rgba(0,0,0,0.08),0_1px_0_rgba(255,255,255,1)] border border-slate-200/40 hover:border-slate-300/60 hover:bg-slate-50/50 hover:shadow-[inset_0_4px_3px_rgb(0_0_0_/_18%),_0_1px_0_rgba(255,255,255,0.8)] active:scale-[0.98] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] ${isChatButtonPressed ? 'shadow-[inset_0_2px_4px_rgba(0,0,0,0.25)] bg-slate-50/50' : ''}`}>
                                <UfoIcon size={18} className="text-slate-500" /><span>New Chat</span>
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto px-4 py-2" style={{ contain: 'content' }}>
                            {Object.entries(groupedChats).map(([group, chats]) => (
                                <div key={group} className="mb-4">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">{group}</div>
                                    <div className="space-y-2">
                                        {chats.map((chat) => (
                                            <div
                                                key={chat.id}
                                                className="p-0.5 rounded-xl shadow-[inset_0_1px_4px_rgba(0,0,0,0.08)]"
                                                style={{
                                                    background: 'linear-gradient(145deg, rgba(241,245,249,0.7) 0%, rgba(226,232,240,0.5) 100%)',
                                                    contain: 'layout style',
                                                }}
                                            >
                                                <MobileChatHistoryItemComponent
                                                    chat={chat}
                                                    isActive={activeChatId === chat.id}
                                                    isNew={chat.isNew}
                                                    onSelect={() => { onSelectChat?.(chat.id); onClose?.(); }}
                                                    onDelete={() => onDeleteChat?.(chat.id)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            {filteredChats.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                                    <ExpressionlessSquareLinear className="w-7 h-7 mb-2 opacity-50" />
                                    <span className="text-sm">{searchQuery ? "No chats found" : "No chat history yet"}</span>
                                </div>
                            )}
                        </div>
                        <div className="px-4 py-3">
                            <ClayPromoCard isMinimized={false} title="Zeta Trial" icon={<UfoIcon size={18} />} description={<span>There are <span className="text-slate-800 font-bold">12 days left</span> for you to enjoy the various features.</span>} action={<button className="w-full text-[10px] font-bold bg-slate-900 text-white py-1.5 px-3 rounded-lg shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 hover:bg-slate-800 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-1.5"><span>Upgrade to Pro</span><TrendingUp size={10} className="text-blue-200" /></button>} />
                        </div>
                        <div className="border-t border-slate-100 p-4 flex justify-center">
                            {!isAuthenticated && (
                                <button
                                    onClick={openSignupModal}
                                    className="px-12 py-1.5 text-sm font-medium text-white bg-gradient-to-b from-slate-700 to-slate-900 rounded-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.15),inset_0_-1px_3px_rgba(0,0,0,0.2),0_2px_4px_rgba(0,0,0,0.1)] border border-slate-600/50 hover:from-slate-600 hover:to-slate-800 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_4px_8px_rgba(0,0,0,0.15)] transition-all duration-200 active:scale-[0.98]"
                                >
                                    Sign up
                                </button>
                            )}
                            {isAuthenticated && (
                                <button onClick={logout} className="w-full flex items-center gap-3 px-3.5 py-2 text-slate-500 hover:text-slate-700 rounded-lg text-sm transition-colors hover:bg-white/60"><LogOut size={18} className="text-slate-500" /><span>Sign Out</span></button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>


            <motion.div
                initial={false}
                animate={{ width: isMinimized ? 70 : 240 }}
                variants={sidebarVariants}
                transition={{
                    type: "spring",
                    stiffness: 110,
                    damping: 10,
                    duration: ANIMATION_CONFIG.duration.medium,
                    ease: ANIMATION_CONFIG.easing.smooth
                }}
                className="hidden md:flex md:flex-col md:flex-shrink-0 bg-[var(--color-bg-sidebar)] overflow-hidden border-r border-[var(--color-border-light)] shadow-sm"
            >
                <motion.div
                    className={`py-4 ${isMinimized ? "px-3" : "px-4"}`}
                    variants={containerVariants}
                    initial={false}
                    animate={isMinimized ? "minimized" : "expanded"}
                >
                    <AnimatePresence mode="wait" initial={false}>
                        {!isMinimized ? (
                            <motion.div
                                key="search-expanded"
                                variants={searchPopVariants}
                                initial="hidden"
                                animate="visible"
                                exit={{ opacity: 0, scale: 0.95, transition: { duration: ANIMATION_CONFIG.duration.fast } }}
                                layout="position"
                            >
                                <ClayInput icon={<Search size={16} />} placeholder="Search chats..." shortcut="/" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                            </motion.div>
                        ) : (
                            <motion.button
                                key="search-minimized"
                                variants={elementVariants}
                                initial="minimized"
                                animate="minimized"
                                exit={{ opacity: 0, scale: 0.9, transition: { duration: ANIMATION_CONFIG.duration.fast } }}
                                transition={{ duration: ANIMATION_CONFIG.duration.fast, ease: ANIMATION_CONFIG.easing.smooth }}
                                className="w-full flex items-center justify-center p-2.5 bg-white rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-[0_2px_6px_rgba(0,0,0,0.05)] transition-shadow"
                            >
                                <motion.div variants={iconVariants} animate="minimized">
                                    <Search size={18} className="text-slate-400" />
                                </motion.div>
                            </motion.button>
                        )}
                    </AnimatePresence>
                </motion.div>
                <motion.div
                    className={`pb-3 ${isMinimized ? "px-3" : "px-4"}`}
                    variants={containerVariants}
                    initial={false}
                    animate={isMinimized ? "minimized" : "expanded"}
                >
                    <AnimatePresence mode="wait" initial={false}>
                        {!isMinimized ? (
                            <motion.button
                                key="new-chat-expanded"
                                layout="position"
                                layoutId="new-chat-button"
                                onClick={handleNewChat}
                                className={`w-full flex items-center rounded-xl text-sm font-medium transition-all duration-300 bg-gradient-to-br from-white via-white to-slate-50 shadow-[0_4px_3px_rgba(0,0,0,0.08),0_1px_0_rgba(255,255,255,1)] border border-slate-200/40 hover:border-slate-300/60 hover:bg-slate-50/50 hover:shadow-[inset_0_1px_3px_rgb(0_0_0_/_18%),_0_1px_0_rgba(255,255,255,0.8)] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] ${isChatButtonPressed ? 'shadow-[inset_0_2px_4px_rgba(0,0,0,0.25)] bg-slate-50/50' : ''} justify-start px-3 py-2 gap-2.5`}
                                variants={elementVariants}
                                initial="hidden"
                                animate="visible"
                                exit={{ opacity: 0, scale: 0.95, transition: { duration: ANIMATION_CONFIG.duration.fast } }}
                                whileTap={{ scale: 0.98 }}
                                transition={{
                                    layout: { duration: ANIMATION_CONFIG.duration.medium, ease: ANIMATION_CONFIG.easing.smooth },
                                    scale: { duration: ANIMATION_CONFIG.duration.fast, ease: ANIMATION_CONFIG.easing.smooth }
                                }}
                            >
                                <motion.div
                                    layout="position"
                                    className="flex-shrink-0"
                                    variants={iconVariants}
                                    transition={{ layout: { duration: ANIMATION_CONFIG.duration.medium, ease: ANIMATION_CONFIG.easing.smooth } }}
                                >
                                    <UfoIcon size={18} className="text-slate-500" />
                                </motion.div>
                                <motion.span
                                    variants={textVariants}
                                    initial="minimized"
                                    animate="expanded"
                                    exit="minimized"
                                    className="whitespace-nowrap"
                                    layout="position"
                                    transition={{ layout: { duration: ANIMATION_CONFIG.duration.medium, ease: ANIMATION_CONFIG.easing.smooth } }}
                                >
                                    New Chat
                                </motion.span>
                            </motion.button>
                        ) : (
                            <motion.button
                                key="new-chat-minimized"
                                layout="position"
                                layoutId="new-chat-button"
                                onClick={handleNewChat}
                                title="New Chat"
                                className={`w-full flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-300 bg-gradient-to-br from-white via-white to-slate-50 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_0_rgba(255,255,255,1)] border border-slate-200/40 hover:border-slate-300/60 hover:bg-slate-50/50 hover:shadow-[inset_0_1px_3px_rgb(0_0_0_/_18%),_0_1px_0_rgba(255,255,255,0.8)] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] ${isChatButtonPressed ? 'shadow-[inset_0_2px_4px_rgba(0,0,0,0.25)] bg-slate-50/50' : ''} p-2`}
                                variants={elementVariants}
                                initial="expanded"
                                animate="minimized"
                                exit={{ opacity: 0, scale: 0.9, transition: { duration: ANIMATION_CONFIG.duration.fast } }}
                                transition={{ duration: ANIMATION_CONFIG.duration.fast, ease: ANIMATION_CONFIG.easing.smooth }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <motion.div variants={iconVariants} animate="minimized">
                                    <UfoIcon size={18} className="text-slate-500" />
                                </motion.div>
                            </motion.button>
                        )}
                    </AnimatePresence>
                </motion.div>
                <motion.div className="flex-1 relative min-h-0">
                    <motion.div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-[#F8F9FB] via-[#F8F9FB]/80 to-transparent z-10 pointer-events-none" initial={{ opacity: 0 }} animate={{ opacity: canScrollUp ? 1 : 0 }} transition={{ duration: ANIMATION_CONFIG.duration.medium, ease: ANIMATION_CONFIG.easing.smooth }} />
                    <motion.div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#F8F9FB] via-[#F8F9FB]/80 to-transparent z-10 pointer-events-none" initial={{ opacity: 0 }} animate={{ opacity: canScrollDown ? 1 : 0 }} transition={{ duration: ANIMATION_CONFIG.duration.medium, ease: ANIMATION_CONFIG.easing.smooth }} />
                    <div
                        ref={navRef}
                        onScroll={handleScroll}
                        className={`h-full overflow-y-auto scrollbar-hide ${isMinimized ? "px-3" : "px-4"}`}
                        style={{ contain: 'content' }}
                    >
                        {Object.entries(groupedChats).map(([group, chats]) => (
                            <div key={group} className="mb-4 pt-2">
                                {!isMinimized && (
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">
                                        {group}
                                    </div>
                                )}
                                <div className="space-y-2">
                                    {chats.map((chat) => (
                                        <div
                                            key={chat.id}
                                            className="p-0.5 rounded-xl shadow-[inset_0_1px_4px_rgba(0,0,0,0.08)]"
                                            style={{
                                                background: 'linear-gradient(145deg, rgba(241,245,249,0.7) 0%, rgba(226,232,240,0.5) 100%)',
                                                contain: 'layout style',
                                            }}
                                        >
                                            <ChatHistoryItemComponent
                                                chat={chat}
                                                isActive={activeChatId === chat.id}
                                                isMinimized={isMinimized}
                                                isNew={chat.isNew}
                                                onSelect={() => onSelectChat?.(chat.id)}
                                                onDelete={() => onDeleteChat?.(chat.id)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                        {filteredChats.length === 0 && !isMinimized && (
                            <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                                <ExpressionlessSquareLinear className="w-7 h-7 mb-2 opacity-50" />
                                <span className="text-sm">{searchQuery ? "No chats found" : "No chat history yet"}</span>
                            </div>
                        )}
                    </div>
                </motion.div>
                <div className={`py-4 w-full ${isMinimized ? "px-3" : "px-4"}`}>
                    <ClayPromoCard isMinimized={isMinimized} title="Zeta Trial" icon={<UfoIcon size={18} />} description={<span>There are <span className="text-slate-800 font-bold">12 days left</span> for you to enjoy the various features.</span>} action={<button className="w-full text-[10px] font-bold bg-slate-900 text-white py-1.5 px-3 rounded-lg shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 hover:bg-slate-800 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-1.5"><span>Upgrade to Pro</span><TrendingUp size={10} className="text-blue-200" /></button>} />
                </div>
                <div className={`pb-4 flex justify-center ${isMinimized ? "px-3" : "px-4"}`}>
                    {!isAuthenticated && (
                        <motion.button
                            onClick={openSignupModal}
                            layout
                            layoutId="signup-button"
                            title={isMinimized ? "Sign up" : undefined}
                            variants={elementVariants}
                            initial="hidden"
                            animate="visible"
                            exit={{ opacity: 0, scale: 0.95, transition: { duration: ANIMATION_CONFIG.duration.fast } }}
                            transition={{
                                layout: {
                                    duration: ANIMATION_CONFIG.duration.medium,
                                    ease: ANIMATION_CONFIG.easing.smooth
                                },
                                scale: { duration: ANIMATION_CONFIG.duration.fast, ease: ANIMATION_CONFIG.easing.smooth }
                            }}
                            className={`flex items-center justify-center text-white bg-gradient-to-b from-slate-700 to-slate-900 rounded-xl text-sm font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.15),inset_0_-1px_3px_rgba(0,0,0,0.2),0_2px_4px_rgba(0,0,0,0.1)] border border-slate-600/50 hover:from-slate-600 hover:to-slate-800 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_4px_8px_rgba(0,0,0,0.15)] active:scale-[0.98] transition-all duration-200 ${isMinimized ? "p-2.5" : "px-8 py-2 w-full"}`}
                        >
                            {!isMinimized && (
                                <motion.span
                                    key="signup-text"
                                    layout="position"
                                    variants={textVariants}
                                    initial="minimized"
                                    animate="expanded"
                                    exit="minimized"
                                    className="whitespace-nowrap"
                                    transition={{ layout: { duration: ANIMATION_CONFIG.duration.medium, ease: ANIMATION_CONFIG.easing.smooth } }}
                                >
                                    Sign up
                                </motion.span>
                            )}
                            {isMinimized && (
                                <motion.span
                                    key="signup-icon"
                                    layout="position"
                                    variants={iconVariants}
                                    initial="expanded"
                                    animate="minimized"
                                    exit="expanded"
                                    className="text-xs font-bold"
                                    transition={{ layout: { duration: ANIMATION_CONFIG.duration.medium, ease: ANIMATION_CONFIG.easing.smooth } }}
                                >
                                    +
                                </motion.span>
                            )}
                        </motion.button>
                    )}
                    {isAuthenticated && (
                        <motion.button
                            onClick={logout}
                            layout
                            layoutId="logout-button"
                            title={isMinimized ? "Sign Out" : undefined}
                            variants={elementVariants}
                            initial="hidden"
                            animate="visible"
                            exit={{ opacity: 0, scale: 0.95, transition: { duration: ANIMATION_CONFIG.duration.fast } }}
                            transition={ANIMATION_CONFIG.easing.spring}
                            className={`flex items-center text-slate-500 hover:text-slate-700 rounded-xl text-sm transition-colors hover:bg-white/60 ${isMinimized ? "justify-center p-2.5" : "w-full justify-start gap-2.5 px-3 py-2"}`}
                        >
                            <motion.div variants={iconVariants} animate={isMinimized ? "minimized" : "expanded"}>
                                <Logout2Linear className="w-[18px] h-[18px] flex-shrink-0" />
                            </motion.div>
                            <AnimatePresence mode="wait" initial={false}>
                                {!isMinimized && (
                                    <motion.span
                                        key="logout-text"
                                        variants={textVariants}
                                        initial="minimized"
                                        animate="expanded"
                                        exit="minimized"
                                        transition={{ duration: ANIMATION_CONFIG.duration.fast, ease: ANIMATION_CONFIG.easing.smooth }}
                                        className="whitespace-nowrap"
                                    >
                                        Sign Out
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </motion.button>
                    )}
                </div>
            </motion.div>
        </>
    );
};

export default Sidebar;
