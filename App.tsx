import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { Toaster } from 'sonner';
import { GlobalTheme } from './components/atoms/GlobalTheme';
import { HamburgerMenuBroken } from './components/atoms/Icons';
import { AuthModal } from './components/molecules/AuthModal';
import { CustomInstructionsModal } from './components/molecules/CustomInstructionsModal';
import { OnboardingTour, shouldShowOnboarding } from './components/molecules/OnboardingTour';
import { ProfilePortal } from './components/molecules/ProfilePortal';
import GlobalHeader from './components/organisms/GlobalHeader';
import Sidebar from './components/organisms/Sidebar';
import ChatInterface from './components/templates/ChatInterface';
import { AuthProvider } from './contexts/AuthContext';
import { useChatHistory } from './hooks/useChatHistory';
import { Message } from './types';

function AppContent() {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
    const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem('zeta_theme');
        return saved === 'dark';
    });

    // Check if onboarding should show on first load
    useEffect(() => {
        if (shouldShowOnboarding()) {
            // Small delay to let the app render first
            const timer = setTimeout(() => setIsOnboardingOpen(true), 500);
            return () => clearTimeout(timer);
        }
    }, []);

    const toggleTheme = useCallback(() => {
        setIsDarkMode(prev => {
            const next = !prev;
            localStorage.setItem('zeta_theme', next ? 'dark' : 'light');
            return next;
        });
    }, []);

    const {
        chatHistory,
        activeChatId,
        selectChat,
        updateMessages,
        deleteChat,
        startNewChat,
        getCurrentMessages
    } = useChatHistory();

    // Initialize a new chat on first load if none exists
    useEffect(() => {
        if (!activeChatId) {
            startNewChat();
        }
    }, []);

    // Handle new chat
    const handleNewChat = useCallback(() => {
        startNewChat();
        setIsSidebarOpen(false);
    }, [startNewChat]);

    // Handle chat selection
    const handleSelectChat = useCallback((chatId: string) => {
        selectChat(chatId);
        setIsSidebarOpen(false);
    }, [selectChat]);

    // Handle chat deletion
    const handleDeleteChat = useCallback((chatId: string) => {
        deleteChat(chatId);
    }, [deleteChat]);

    // Handle messages update from ChatInterface
    const handleMessagesChange = useCallback((messages: Message[], isStreamingComplete?: boolean) => {
        updateMessages(messages, isStreamingComplete);
    }, [updateMessages]);

    // Close sidebar (for mobile)
    const handleCloseSidebar = () => {
        setIsSidebarOpen(false);
    };

    return (
        <>
            <GlobalTheme isDarkMode={isDarkMode} />
            <Toaster
                position="bottom-center"
                expand={false}
                richColors
                closeButton
                toastOptions={{
                    style: {
                        fontSize: '11px',
                        padding: '8px 12px',
                        minHeight: 'auto',
                        maxWidth: '280px',
                        width: 'auto',
                    },
                    className: "sonner-toast-mobile-center"
                }}
            />
            <div className="flex flex-col h-screen bg-[#F8F9FB] overflow-x-hidden overflow-y-hidden font-sans text-slate-800" style={{ height: '100dvh' }}>
                {/* Global Header - hidden on mobile */}
                <div className="hidden md:block">
                    <GlobalHeader
                        isSidebarMinimized={isSidebarMinimized}
                        onToggleSidebar={() => setIsSidebarMinimized(!isSidebarMinimized)}
                        isDarkMode={isDarkMode}
                        onToggleTheme={toggleTheme}
                        onOpenProfile={() => setIsProfileOpen(true)}
                        isProfileOpen={isProfileOpen}
                        onOpenHelp={() => setIsOnboardingOpen(true)}
                    />
                </div>

                {/* Main Layout Body */}
                <div className="flex flex-1 md:pt-14 overflow-hidden relative">

                    {/* Mobile Sidebar Overlay */}
                    <AnimatePresence>
                        {isSidebarOpen && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="fixed inset-0 bg-black/30 z-40 md:hidden"
                                onClick={handleCloseSidebar}
                            />
                        )}
                    </AnimatePresence>

                    {/* Sidebar Component */}
                    <Sidebar
                        isOpen={isSidebarOpen}
                        isMinimized={isSidebarMinimized}
                        onClose={() => setIsSidebarOpen(false)}
                        onNewChat={handleNewChat}
                        onSelectChat={selectChat}
                        onDeleteChat={deleteChat}
                        chatHistory={chatHistory}
                        activeChatId={activeChatId}
                        isInitialLoad={activeChatId === null}
                        onOpenProfile={() => setIsProfileOpen(true)}
                        onOpenHelp={() => setIsOnboardingOpen(true)}
                    />

                    {/* Main Content */}
                    <div className="flex-1 flex flex-col min-w-0 h-full min-h-0 p-0 md:p-[10px]">
                        <div className="flex-1 md:rounded-[32px] flex flex-col relative h-full min-h-0">
                            {/* Mobile Top Left Corner Shape */}
                            <div className="md:hidden absolute top-0 left-0 z-10 pointer-events-none" style={{ width: '280px', height: '280px' }}>
                                <svg width="0" height="0" className="absolute">
                                    <defs>
                                        <clipPath id="v4" clipPathUnits="objectBoundingBox">
                                            <path d="M0,0 H0.2 V0.1 Q0.2,0.2 0.1,0.2 H0 Z" />
                                        </clipPath>
                                    </defs>
                                </svg>
                                <div
                                    className="bg-white/80 backdrop-blur-md absolute top-0 left-0"
                                    style={{
                                        clipPath: 'url(#v4)',
                                        width: '100%',
                                        height: '100%'
                                    }}
                                />
                            </div>

                            {/* Mobile Hamburger Button */}
                            <div className="md:hidden absolute top-0 left-0 z-20">
                                <button
                                    onClick={() => setIsSidebarOpen(true)}
                                    className="p-3 text-slate-600 transition-colors active:text-slate-800"
                                >
                                    <HamburgerMenuBroken className="w-[26px] h-[26px]" />
                                </button>
                            </div>

                            <ChatInterface
                                isSidebarMinimized={isSidebarMinimized}
                                initialMessages={getCurrentMessages()}
                                activeChatId={activeChatId || 'new'}
                                onMessagesChange={handleMessagesChange}
                            />

                        </div>
                    </div>
                </div>
            </div>

            {/* Auth Modal */}
            <AuthModal />

            {/* Profile & Instructions */}
            <ProfilePortal
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                isDarkMode={isDarkMode}
                onToggleTheme={toggleTheme}
                onOpenInstructions={() => setIsInstructionsOpen(true)}
            />

            <CustomInstructionsModal
                isOpen={isInstructionsOpen}
                onClose={() => setIsInstructionsOpen(false)}
            />

            {/* Onboarding Tour */}
            <OnboardingTour
                isOpen={isOnboardingOpen}
                onClose={() => setIsOnboardingOpen(false)}
            />
        </>
    );
}

function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;
