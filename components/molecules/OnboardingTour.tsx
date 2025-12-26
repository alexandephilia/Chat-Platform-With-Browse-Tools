import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, MessageSquare, Mic, Search, Sparkles, X } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

const ONBOARDING_STORAGE_KEY = 'zeta_onboarding_completed';

interface OnboardingStep {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
}

const UfoIcon: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = "" }) => (
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

const steps: OnboardingStep[] = [
    {
        id: 'welcome',
        title: 'Welcome to Zeta',
        description: 'Your intelligent AI assistant. Let me show you around.',
        icon: <UfoIcon size={42} />,
    },
    {
        id: 'chat',
        title: 'Start a Conversation',
        description: 'Type your message or question in the chat input. Zeta will assist you.',
        icon: <MessageSquare size={42} />,
    },
    {
        id: 'voice',
        title: 'Voice Input',
        description: 'Prefer talking? Use the microphone button. Zeta will transcribe and respond.',
        icon: <Mic size={42} />,
    },
    {
        id: 'search',
        title: 'Search Your Chats',
        description: 'Use search through your conversation history. All your chats are saved locally.',
        icon: <Search size={42} />,
    },
    {
        id: 'ready',
        title: "You're All Set!",
        description: 'Start chatting with Zeta. You can always access this tour again from the "Need Help?" button.',
        icon: <Sparkles size={42} />,
    },
];

interface OnboardingTourProps {
    isOpen: boolean;
    onClose: () => void;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ isOpen, onClose }) => {
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        if (isOpen) {
            setCurrentStep(0);
        }
    }, [isOpen]);

    const handleNext = useCallback(() => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            // Mark onboarding as completed
            localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
            onClose();
        }
    }, [currentStep, onClose]);

    const handlePrev = useCallback(() => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    }, [currentStep]);

    const handleSkip = useCallback(() => {
        localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
        onClose();
    }, [onClose]);

    // Keyboard navigation
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'ArrowRight':
                case 'Enter':
                    handleNext();
                    break;
                case 'ArrowLeft':
                    handlePrev();
                    break;
                case 'Escape':
                    handleSkip();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, handleNext, handlePrev, handleSkip]);

    const step = steps[currentStep];
    const isLastStep = currentStep === steps.length - 1;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-[10010] flex items-center justify-center p-4"
                >
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        onClick={handleSkip}
                    />

                    {/* Modal */}
                    <motion.div
                        layout
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{
                            type: 'spring',
                            damping: 25,
                            stiffness: 300,
                            layout: { duration: 0.3, type: "spring", stiffness: 300, damping: 30 }
                        }}
                        className="relative w-full max-w-sm"
                    >
                        {/* Outer rim */}
                        <motion.div layout className="p-1 bg-gradient-to-b from-white to-slate-300 rounded-[28px] shadow-2xl">
                            {/* Middle rim */}
                            <motion.div layout className="p-1 bg-slate-100 rounded-[26px] shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]">
                                {/* Inner card */}
                                <motion.div
                                    layout
                                    className="bg-gradient-to-b from-white to-[#FAFAFA] rounded-[24px] overflow-hidden border border-white/80 p-6"
                                >
                                    <AnimatePresence mode="popLayout" initial={false}>
                                        <motion.div
                                            key={step.id}
                                            initial={{ opacity: 0, x: 20, filter: 'blur(8px)' }}
                                            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                                            exit={{ opacity: 0, x: -20, filter: 'blur(8px)' }}
                                            transition={{
                                                duration: 0.20,
                                                ease: "easeOut"
                                            }}
                                        >
                                            {/* Icon */}
                                            <div className="relative w-20 h-20 mx-auto mb-6 group">
                                                <div className="absolute inset-0 bg-blue-500/20 rounded-[24px] blur-xl transform translate-y-4" />
                                                <div className="relative w-full h-full rounded-[24px] bg-gradient-to-b from-white to-[#6ba2e840] flex items-center justify-center shadow-[0_8px_20px_rgba(59,130,246,0.15),inset_0_-4px_4px_rgba(0,0,0,0.05),inset_0_2px_4px_rgba(255,255,255,1)] border border-blue-100 p-1">
                                                     {/* Inner bevel */}
                                                     <div className="w-full h-full rounded-[20px] bg-gradient-to-br from-blue-50 to-white flex items-center justify-center border border-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] text-blue-500 overflow-hidden relative">
                                                        {step.icon}
                                                        
                                                        {/* Glare animation */}
                                                        <motion.div
                                                            initial={{ x: '-100%', opacity: 0 }}
                                                            animate={{ x: '100%', opacity: [0, 1, 0.5, 0] }}
                                                            transition={{ 
                                                                repeat: Infinity, 
                                                                duration: 1.5, 
                                                                ease: "easeInOut",
                                                                repeatDelay: 0.75
                                                            }}
                                                            className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent -skew-x-12 opacity-70 mix-blend-overlay"
                                                        />
                                                     </div>
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="text-center mb-6">
                                                <h2 className="text-5xl font-medium text-slate-800 mb-2" style={{ fontFamily: '"Instrument Serif", serif' }}>{step.title}</h2>
                                                <p className="text-sm text-slate-500 leading-relaxed px-2 text-balance">{step.description}</p>
                                            </div>
                                        </motion.div>
                                    </AnimatePresence>

                                    {/* Progress dots */}
                                    <div className="flex justify-center gap-1.5 mb-6">
                                        {steps.map((_, index) => (
                                            <motion.div
                                                key={index}
                                                layout
                                                className={`h-1.5 rounded-full transition-all duration-300 ${index === currentStep
                                                    ? 'w-6 bg-blue-500'
                                                    : index < currentStep
                                                        ? 'w-1.5 bg-blue-300'
                                                        : 'w-1.5 bg-slate-200'
                                                    }`}
                                            />
                                        ))}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex justify-center gap-3">
                                        {!isLastStep && (
                                            <button
                                                onClick={handleSkip}
                                                className="px-6 py-2.5 text-[13px] font-medium text-slate-500 hover:text-slate-700 rounded-xl transition-all bg-slate-50/80 hover:bg-slate-100/80 shadow-[inset_0_1px_1px_rgba(255,255,255,1),0_1px_2px_rgba(0,0,0,0.04)]"
                                            >
                                                Skip
                                            </button>
                                        )}
                                        <motion.button
                                            whileTap={{ scale: 0.97 }}
                                            onClick={handleNext}
                                            className={`relative px-6 py-2.5 rounded-xl text-white text-[13px] font-semibold overflow-hidden flex items-center gap-2 justify-center transition-all duration-200 bg-gradient-to-b from-blue-400 to-blue-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),inset_0_-1px_1px_rgba(0,0,0,0.1),0_4px_12px_rgba(59,130,246,0.35)] hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_6px_16px_rgba(59,130,246,0.4)]`}
                                        >
                                            <span className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                                            {isLastStep ? "Get Started" : "Next"}
                                            {!isLastStep && <ArrowRight size={14} />}
                                        </motion.button>
                                    </div>
                                </motion.div>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// Helper to check if onboarding should show
export const shouldShowOnboarding = (): boolean => {
    return localStorage.getItem(ONBOARDING_STORAGE_KEY) !== 'true';
};

// Helper to reset onboarding (for testing)
export const resetOnboarding = (): void => {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
};
