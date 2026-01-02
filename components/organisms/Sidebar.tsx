import { AnimatePresence, motion, Variants } from "framer-motion";
import { ChevronDown, LogOut, MoreHorizontal, Search, Trash2, TrendingUp, X } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { useAuth } from "../../contexts/AuthContext";
import { ClayInput } from "../atoms/ClayInput";
import { ClayPill } from "../atoms/ClayPill";
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


const pageLoadVariants: Variants = {
    hidden: { opacity: 0, x: -20, filter: 'blur(10px)' },
    visible: (i: number) => ({
        opacity: 1,
        x: 0,
        filter: 'blur(0px)',
        transition: {
            duration: 0.6,
            delay: 0.2 + (i * 0.1),
            ease: [0.22, 1, 0.36, 1]
        }
    })
};

interface SidebarProps {
    isOpen: boolean;
    isMinimized?: boolean;
    onClose?: () => void;
    onNewChat?: () => void;
    onSelectChat?: (chatId: string) => void;
    onDeleteChat?: (chatId: string) => void;
    chatHistory?: ChatHistoryItem[];
    activeChatId?: string | null;
    isInitialLoad?: boolean;
    onOpenProfile?: () => void;
    onOpenHelp?: () => void;
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
                className={`relative w-full flex items-center rounded-[8px] text-sm transition-all duration-150 overflow-hidden  ${isMinimized ? "justify-center px-1 py-1.5" : "justify-start px-2 py-1"} ${isActive ? "bg-gradient-to-b from-white to-slate-50 text-slate-800 shadow-[0_2px_3px_rgba(0,0,0,0.12),0_1px_1px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.95),inset_1px_1px_2px_rgba(255,255,255,0.3),inset_-1px_1px_2px_rgba(255,255,255,0.3)] !border-slate-200/60" : isNew ? "text-blue-600 hover:bg-gradient-to-b hover:from-white hover:to-[#d5d5d536] hover:shadow-[0_2px_4px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.95)]" : "text-slate-600 hover:bg-gradient-to-b hover:from-white hover:to-[#d5d5d536] hover:shadow-[0_2px_4px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.95)] hover:text-slate-700"}`}
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
                        className="p-1 rounded-lg bg-white/70 backdrop-blur-sm shadow-[0_2px_8px_rgba(0,0,0,0.08)] text-slate-400 hover:text-slate-600 hover:bg-white/90 transition-all duration-150"
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
                        className="bg-white rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.15),0_2px_4px_rgba(0,0,0,0.08)] overflow-hidden"
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
                className={`relative w-full flex items-center gap-2 px-2 py-1 rounded-[8px] text-[13px] transition-colors duration-150 overflow-hidden border border-transparent ${isActive ? "bg-gradient-to-b from-white to-[#d5d5d536] text-slate-800 shadow-[0_2px_4px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.95),inset_1px_1px_2px_rgba(255,255,255,0.3),inset_-1px_1px_2px_rgba(255,255,255,0.3)] !border-slate-200/60" : isNew ? "text-blue-600 active:bg-[#d5d5d536]" : "text-slate-600 active:bg-[#d5d5d536]"}`}
                style={{ transform: 'translateZ(0)', contain: 'layout style' }}
            >
                <div className="relative flex-shrink-0">
                    <ChatRoundLineLinear size={16} className={isNew ? "text-blue-500" : "text-slate-400"} />
                    {isNew && (
                        <span
                            className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-blue-500"
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
                    className="p-1 rounded-lg bg-white/80 shadow-sm border border-slate-200/20 text-slate-400 active:scale-95 active:bg-white transition-transform duration-150"
                    style={{ transform: 'translateZ(0)' }}
                >
                    <MoreHorizontal size={12} />
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
                        className="bg-white rounded-xl shadow-lg overflow-hidden"
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
}, (prevProps, nextProps) => {
    // Custom comparison to prevent unnecessary re-renders
    return (
        prevProps.chat.id === nextProps.chat.id &&
        prevProps.chat.title === nextProps.chat.title &&
        prevProps.isActive === nextProps.isActive &&
        prevProps.isNew === nextProps.isNew
    );
});

const Sidebar: React.FC<SidebarProps> = ({
    isOpen,
    isMinimized = false,
    onClose,
    onNewChat,
    onSelectChat,
    onDeleteChat,
    chatHistory = [],
    activeChatId,
    isInitialLoad = false,
    onOpenProfile,
    onOpenHelp
}) => {
    const { isAuthenticated, user, logout, openLoginModal, openSignupModal } = useAuth();
    const navRef = useRef<HTMLDivElement>(null);
    const mobileNavRef = useRef<HTMLDivElement>(null);
    const [canScrollUp, setCanScrollUp] = useState(false);
    const [canScrollDown, setCanScrollDown] = useState(false);
    const [mobileCanScrollUp, setMobileCanScrollUp] = useState(false);
    const [mobileCanScrollDown, setMobileCanScrollDown] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isChatButtonPressed, setIsChatButtonPressed] = useState(false);

    // Track if mobile sidebar has been opened before to skip animations on subsequent opens
    const hasMobileOpenedRef = useRef(false);

    const handleScroll = useCallback(() => {
        if (navRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = navRef.current;
            setCanScrollUp(scrollTop > 2);
            setCanScrollDown(scrollTop < scrollHeight - clientHeight - 2);
        }
    }, []);

    const handleMobileScroll = useCallback(() => {
        if (mobileNavRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = mobileNavRef.current;
            setMobileCanScrollUp(scrollTop > 2);
            setMobileCanScrollDown(scrollTop < scrollHeight - clientHeight - 2);
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

    React.useEffect(() => {
        handleMobileScroll();
        const mobileNavEl = mobileNavRef.current;
        if (mobileNavEl) {
            const resizeObserver = new ResizeObserver(handleMobileScroll);
            resizeObserver.observe(mobileNavEl);
            return () => resizeObserver.disconnect();
        }
    }, [handleMobileScroll]);

    const filteredChats = useMemo(() => {
        if (!searchQuery.trim()) return chatHistory;
        return chatHistory.filter(chat => chat.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [chatHistory, searchQuery]);

    const groupedChats = useMemo(() => groupChatsByTimeline(filteredChats), [filteredChats]);

    // Memoize callbacks to prevent re-renders in child components
    const handleSelectChat = useCallback((chatId: string) => {
        onSelectChat?.(chatId);
        onClose?.();
    }, [onSelectChat, onClose]);

    const handleDeleteChatCallback = useCallback((chatId: string) => {
        onDeleteChat?.(chatId);
    }, [onDeleteChat]);

    const handleNewChat = useCallback(() => {
        setIsChatButtonPressed(true);
        setTimeout(() => setIsChatButtonPressed(false), 150);
        onNewChat?.();
        onClose?.();
    }, [onNewChat, onClose]);

    const isInitializedInternalRef = useRef(false);
    const shouldShowPageLoadAnimation = isInitialLoad && !isInitializedInternalRef.current;

    React.useEffect(() => {
        if (isOpen) {
            isInitializedInternalRef.current = true;
            hasMobileOpenedRef.current = true;
        }
    }, [isOpen]);

    return (
        <>
            <AnimatePresence initial={false} mode="wait">
                {isOpen && (
                    <motion.div
                        key="mobile-sidebar"
                        initial={{ x: "-100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "-100%" }}
                        transition={{
                            duration: 0.3,
                            ease: [0.32, 0.72, 0, 1]
                        }}
                        className="fixed inset-y-0 left-0 z-50 w-[240px] bg-[var(--color-bg-sidebar)] flex flex-col overflow-hidden shadow-xl md:hidden rounded-r-3xl"
                        style={{ willChange: 'transform', transform: 'translateZ(0)', contain: 'layout style paint' }}
                    >
                        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                {isAuthenticated ? (
                                    <div
                                        onClick={onOpenProfile}
                                        className="flex items-center gap-1 text-slate-500 cursor-pointer hover:text-slate-700 transition-colors"
                                    >
                                        <UserAvatar initials={user?.firstName?.charAt(0).toUpperCase() || 'U'} src={user?.avatar} size="sm" />
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
                            <div className="p-[3px] rounded-[14px] bg-gradient-to-b from-white via-slate-50/50 to-slate-100/80 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02),0_1px_0_rgba(255,255,255,0.8)]">
                                <button onClick={handleNewChat} className={`relative w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-[13px] font-medium transition-shadow duration-150 overflow-hidden bg-gradient-to-b from-white to-slate-100 ${isChatButtonPressed ? 'shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]' : 'shadow-[0_4px_12px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,1)]'} active:scale-[0.98]`}>
                                    <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none" />
                                    <UfoIcon size={16} className="text-slate-700" />
                                    <span className="text-slate-700">New Chat</span>
                                </button>
                            </div>
                        </div>
                        <div
                            className="flex-1 overflow-y-auto px-4 py-2 relative"
                            style={{ contain: 'content' }}
                        >
                            {/* Fade gradients for mobile scroll */}
                            <motion.div
                                className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-[var(--color-bg-sidebar)] via-[var(--color-bg-sidebar)]/80 to-transparent z-10 pointer-events-none"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: mobileCanScrollUp ? 1 : 0 }}
                                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            />
                            <motion.div
                                className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[var(--color-bg-sidebar)] via-[var(--color-bg-sidebar)]/80 to-transparent z-10 pointer-events-none"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: mobileCanScrollDown ? 1 : 0 }}
                                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            />
                            <div
                                ref={mobileNavRef}
                                onScroll={handleMobileScroll}
                                className="h-full overflow-y-auto scrollbar-hide"
                            >
                                {Object.entries(groupedChats).map(([group, chats]) => (
                                    <div key={group} className="mb-4">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">{group}</div>
                                        <div className="space-y-2">
                                            {chats.map((chat) => (
                                                <div
                                                    key={chat.id}
                                                    className="p-[3px] rounded-[10px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] relative overflow-hidden bg-slate-100/60"
                                                    style={{ contain: 'layout style' }}
                                                >
                                                    <MobileChatHistoryItemComponent
                                                        chat={chat}
                                                        isActive={activeChatId === chat.id}
                                                        isNew={chat.isNew}
                                                        onSelect={() => handleSelectChat(chat.id)}
                                                        onDelete={() => handleDeleteChatCallback(chat.id)}
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
                        </div>
                        <div className="px-4 py-3">
                            <ClayPromoCard isMinimized={false} animateOnMount={true} title="Zeta Trial" icon={<UfoIcon size={18} />} description={<span>There are <span className="text-slate-800 font-bold">12 days left</span> for you to enjoy the various features.</span>} action={<div className="w-full p-[1.5px] rounded-[10px] bg-gradient-to-b from-slate-400/60 via-slate-600/40 to-slate-800/60"><button className="relative w-full text-[10px] font-bold text-white py-2 px-3 rounded-[8.5px] overflow-hidden shadow-md active:scale-[0.98] transition-transform duration-150 flex items-center justify-center gap-1.5" style={{ background: 'linear-gradient(180deg, #475569 0%, #1e293b 25%, #0f172a 100%)' }}><span className="relative z-10 text-white">Upgrade to Pro</span><TrendingUp size={10} className="relative z-10 text-cyan-200" /></button></div>} />
                        </div>
                        <div className="px-4 pb-2 flex justify-center">
                            <ClayPill size="sm" onClick={() => { onOpenHelp?.(); onClose?.(); }}>Need Help?</ClayPill>
                        </div>
                        {!isAuthenticated && (
                            <div className="border-t border-slate-100 px-4 py-3 flex justify-center">
                                <button
                                    onClick={openSignupModal}
                                    className="px-10 py-1.5 text-[13px] font-medium text-white bg-gradient-to-b from-slate-700 to-slate-900 rounded-xl shadow-md border border-slate-600/50 active:scale-[0.98] transition-transform duration-150"
                                >
                                    Sign up
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                initial={false}
                animate={{ width: isMinimized ? 70 : 240 }}
                variants={sidebarVariants}
                transition={{
                    type: "spring",
                    stiffness: 130,
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
                    <motion.div
                        custom={0}
                        variants={pageLoadVariants}
                        initial={shouldShowPageLoadAnimation ? "hidden" : false}
                        animate="visible"
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
                </motion.div>
                <motion.div
                    className={`pb-3 ${isMinimized ? "px-3" : "px-4"}`}
                    variants={containerVariants}
                    initial={false}
                    animate={isMinimized ? "minimized" : "expanded"}
                    custom={1}
                >
                    <motion.div
                        variants={pageLoadVariants}
                        initial={shouldShowPageLoadAnimation ? "hidden" : false}
                        animate="visible"
                        custom={1}
                    >
                        <AnimatePresence mode="wait" initial={false}>
                            {!isMinimized ? (
                                <motion.div
                                    key="new-chat-expanded-wrapper"
                                    layout="position"
                                    className="p-[3px] rounded-[14px] bg-gradient-to-b from-white via-slate-50/50 to-slate-100/80 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02),0_1px_0_rgba(255,255,255,0.8)]"
                                    variants={elementVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit={{ opacity: 0, scale: 0.85, transition: { duration: ANIMATION_CONFIG.duration.fast } }}
                                >
                                    <motion.button
                                        layoutId="new-chat-button"
                                        onClick={handleNewChat}
                                        className={`relative w-full flex items-center rounded-xl text-sm font-medium transition-all duration-300 justify-start px-3 py-2 gap-2.5 overflow-hidden bg-gradient-to-b from-white to-slate-100 ${isChatButtonPressed ? 'shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]' : 'shadow-[0_4px_12px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,1)]'} hover:shadow-[0_8px_24px_rgba(0,0,0,0.12),0_4px_8px_rgba(0,0,0,0.06)] hover:border-slate-300/60 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]`}
                                        whileTap={{ scale: 0.98 }}
                                        transition={{
                                            layout: { duration: ANIMATION_CONFIG.duration.medium, ease: ANIMATION_CONFIG.easing.smooth },
                                            scale: { duration: ANIMATION_CONFIG.duration.fast, ease: ANIMATION_CONFIG.easing.smooth }
                                        }}
                                    >
                                        {/* Top shine inset */}
                                        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none" />
                                        <motion.div
                                            layout="position"
                                            className="flex-shrink-0"
                                            variants={iconVariants}
                                            transition={{ layout: { duration: ANIMATION_CONFIG.duration.medium, ease: ANIMATION_CONFIG.easing.smooth } }}
                                        >
                                            <UfoIcon size={18} className="text-slate-700" />
                                        </motion.div>
                                        <motion.span
                                            variants={textVariants}
                                            initial="minimized"
                                            animate="expanded"
                                            exit="minimized"
                                            className="whitespace-nowrap text-slate-700 font-semibold"
                                            layout="position"
                                            transition={{ layout: { duration: ANIMATION_CONFIG.duration.medium, ease: ANIMATION_CONFIG.easing.smooth } }}
                                        >
                                            New Chat
                                        </motion.span>
                                    </motion.button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="new-chat-minimized-wrapper"
                                    layout="position"
                                    className="p-[3px] rounded-[14px] bg-gradient-to-b from-white via-slate-50/50 to-slate-100/80 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02),0_1px_0_rgba(255,255,255,0.8)]"
                                    variants={elementVariants}
                                    initial="expanded"
                                    animate="minimized"
                                    exit={{ opacity: 0, scale: 0.9, transition: { duration: ANIMATION_CONFIG.duration.fast } }}
                                >
                                    <motion.button
                                        layoutId="new-chat-button"
                                        onClick={handleNewChat}
                                        title="New Chat"
                                        className={`relative w-full flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-300 p-2 overflow-hidden bg-gradient-to-b from-white to-slate-100 ${isChatButtonPressed ? 'shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]' : 'shadow-[0_4px_12px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,1)]'} hover:shadow-[0_8px_24px_rgba(0,0,0,0.12),0_4px_8px_rgba(0,0,0,0.06)] hover:border-slate-300/60 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]`}
                                        transition={{ duration: ANIMATION_CONFIG.duration.fast, ease: ANIMATION_CONFIG.easing.smooth }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {/* Top shine inset */}
                                        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none" />
                                        <motion.div variants={iconVariants} animate="minimized">
                                            <UfoIcon size={18} className="text-slate-700" />
                                        </motion.div>
                                    </motion.button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </motion.div>
                <motion.div
                    className="flex-1 relative min-h-0"
                    custom={2}
                    variants={pageLoadVariants}
                    initial={shouldShowPageLoadAnimation ? "hidden" : false}
                    animate="visible"
                >
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
                                            className="p-[3px] rounded-[10px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.08),inset_0_0_0_1px_rgba(0,0,0,0.02)] relative overflow-hidden"
                                            style={{
                                                background: 'linear-gradient(145deg, rgba(241,245,249,0.8) 0%, rgba(226,232,240,0.6) 100%)',
                                                contain: 'layout style',
                                            }}
                                        >
                                            {/* Top inset gradient - subtle highlight */}
                                            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/70 to-transparent pointer-events-none" />
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
                <motion.div
                    className={`py-4 w-full ${isMinimized ? "px-3" : "px-4"}`}
                    custom={3}
                    variants={pageLoadVariants}
                    initial={shouldShowPageLoadAnimation ? "hidden" : false}
                    animate="visible"
                >
                    <ClayPromoCard isMinimized={isMinimized} animateOnMount={shouldShowPageLoadAnimation} title="Zeta Trial" icon={<UfoIcon size={18} />} description={<span>There are <span className="text-slate-800 font-bold">12 days left</span> for you to enjoy the various features.</span>} action={<div className="w-full p-[1.5px] rounded-[10px] bg-gradient-to-b from-slate-400/60 via-slate-600/40 to-slate-800/60"><button className="relative w-full text-[10px] font-bold text-white py-2 px-3 rounded-[8.5px] overflow-hidden shadow-[0_4px_12px_rgba(59,130,246,0.35),0_2px_4px_rgba(0,0,0,0.2),inset_0_-2px_6px_rgba(0,0,0,0.3)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.45),0_3px_6px_rgba(0,0,0,0.25),inset_0_-2px_6px_rgba(0,0,0,0.25)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] active:shadow-[inset_0_2px_8px_rgba(0,0,0,0.4),inset_0_1px_2px_rgba(0,0,0,0.3)] transition-all duration-200 flex items-center justify-center gap-1.5" style={{ background: 'linear-gradient(180deg, #475569 0%, #1e293b 25%, #0f172a 100%)' }}><div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" /><span className="relative z-10 bg-gradient-to-r from-white via-slate-400 to-white bg-[length:400%_100%] bg-clip-text text-transparent animate-shimmer-pro drop-shadow-[0_0_12px_rgba(255,255,255,0.6)]">Upgrade to Pro</span><TrendingUp size={10} className="relative z-10 text-cyan-200 animate-icon-glow-pro" /></button></div>} />
                </motion.div>
                <motion.div
                    className={`pb-4 flex justify-center ${isMinimized ? "px-3" : "px-4"}`}
                    variants={containerVariants}
                    initial={false}
                    animate={isMinimized ? "minimized" : "expanded"}
                    custom={4}
                >
                    <motion.div
                        variants={pageLoadVariants}
                        initial={shouldShowPageLoadAnimation ? "hidden" : false}
                        animate="visible"
                        custom={4}
                        className="w-full h-full flex justify-center"
                    >
                        <AnimatePresence mode="wait">
                            {!isAuthenticated ? (
                                <motion.button
                                    key="signup-button"
                                    onClick={openSignupModal}
                                    layoutId="signup-button"
                                    title={isMinimized ? "Sign up" : undefined}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className={`flex items-center justify-center text-white bg-gradient-to-b from-slate-700 to-slate-900 rounded-xl text-sm font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.15),inset_0_-1px_3px_rgba(0,0,0,0.2),0_2px_4px_rgba(0,0,0,0.1)] border border-slate-600/50 hover:from-slate-600 hover:to-slate-800 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_4px_8px_rgba(0,0,0,0.15)] active:scale-[0.98] transition-all duration-200 ${isMinimized ? "p-2.5" : "px-8 py-2 w-full"}`}
                                >
                                    {!isMinimized ? (
                                        <motion.span
                                            key="signup-text"
                                            layout="position"
                                            variants={textVariants}
                                            initial="minimized"
                                            animate="expanded"
                                            exit="minimized"
                                            className="whitespace-nowrap"
                                        >
                                            Sign up
                                        </motion.span>
                                    ) : (
                                        <motion.span
                                            key="signup-icon"
                                            layout="position"
                                            variants={iconVariants}
                                            initial="expanded"
                                            animate="minimized"
                                            exit="expanded"
                                            className="text-xs font-bold"
                                        >
                                            +
                                        </motion.span>
                                    )}
                                </motion.button>
                            ) : (
                                <AnimatePresence mode="wait" initial={false}>
                                    {isMinimized ? (
                                        <motion.button
                                            key="logout-min"
                                            onClick={logout}
                                            title="Sign Out"
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.1 } }}
                                            className="flex items-center justify-center rounded-xl text-sm font-medium transition-all bg-gradient-to-b from-red-50 to-red-100/80 border border-red-200/60 shadow-[0_2px_4px_rgba(239,68,68,0.15),0_1px_2px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.8)] text-red-600 hover:text-red-700 hover:shadow-[0_3px_6px_rgba(239,68,68,0.2),0_1px_2px_rgba(0,0,0,0.06)] p-2.5"
                                        >
                                            <LogOut size={14} className="text-red-500" />
                                        </motion.button>
                                    ) : (
                                        <motion.button
                                            key="logout-max"
                                            onClick={logout}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.1 } }}
                                            className="w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all bg-gradient-to-b from-red-50 to-red-100/80 border border-red-200/60 shadow-[0_2px_4px_rgba(239,68,68,0.15),0_1px_2px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.8)] text-red-600 hover:text-red-700 hover:shadow-[0_3px_6px_rgba(239,68,68,0.2),0_1px_2px_rgba(0,0,0,0.06)]"
                                        >
                                            <LogOut size={14} className="text-red-500" />
                                            <span className="whitespace-nowrap">Sign Out</span>
                                        </motion.button>
                                    )}
                                </AnimatePresence>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </motion.div>
            </motion.div>
        </>
    );
};

export default Sidebar;
