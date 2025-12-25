/**
 * WelcomeScreen - The greeting and suggestions shown before chat starts
 */

import { AnimatePresence, motion, Variants } from 'framer-motion';
import React, { useMemo, useState } from 'react';
import { getRandomSuggestions, SuggestionCard } from '../../data/suggestions';
import { Attachment } from '../../types';
import { getTimeBasedGreeting } from '../../utils/time';
import { ClayButton } from '../atoms/ClayButton';
import { BadgePill } from '../atoms/ClayPill';
import { ClayCard } from '../molecules/ClayCard';
import ModelPicker, { AIModel } from '../molecules/ModelPicker';
import ChatInput from '../organisms/ChatInput';

interface WelcomeScreenProps {
    selectedModel: AIModel;
    onSelectModel: (model: AIModel) => void;
    onSendMessage: (text: string, attachments?: Attachment[], webSearchEnabled?: boolean, searchType?: 'auto' | 'fast' | 'deep') => void;
    isLoading: boolean;
    webSearchEnabled: boolean;
    onWebSearchToggle: (enabled: boolean) => void;
    searchType: 'auto' | 'fast' | 'deep';
    onSearchTypeChange: (type: 'auto' | 'fast' | 'deep') => void;
    reasoningEnabled: boolean;
    onReasoningToggle: (enabled: boolean) => void;
    hasAttachments?: boolean;
    isSidebarMinimized?: boolean;
}

// Animation variants - Smooth blur reveal with GPU acceleration
const greetingVariants: Variants = {
    hidden: { opacity: 0, y: 50, filter: 'blur(12px)' },
    visible: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: {
            duration: 0.7,
            ease: [0.22, 1, 0.36, 1],
            staggerChildren: 0.15,
            delayChildren: 0.1,
        }
    },
};

const logoVariants: Variants = {
    hidden: { x: 40, opacity: 0, scale: 0.9, filter: 'blur(12px)' },
    visible: {
        x: 0,
        opacity: 1,
        scale: 1.6,
        filter: 'blur(0px)',
        transition: {
            type: "spring",
            stiffness: 80,
            damping: 18,
            delay: 0.6,
        }
    }
};

const pillVariants: Variants = {
    hidden: { scale: 0, opacity: 0, rotate: 0, filter: 'blur(10px)' },
    visible: {
        scale: 1.2,
        opacity: 1,
        rotate: 9,
        filter: 'blur(0px)',
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 14,
            delay: 0.9,
        }
    }
};

const titleVariants: Variants = {
    hidden: { opacity: 0, y: 30, filter: 'blur(12px)' },
    visible: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: {
            duration: 0.8,
            delay: 0.6,
            ease: [0.22, 1, 0.36, 1],
        }
    }
};

const descVariants: Variants = {
    hidden: { opacity: 0, y: 20, filter: 'blur(10px)' },
    visible: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: {
            duration: 0.7,
            delay: 0.55,
            ease: [0.22, 1, 0.36, 1],
        }
    }
};

// Mobile card variants - consistent with desktop
const mobileCardVariants: Variants = {
    hidden: { opacity: 0, filter: 'blur(16px)', scale: 0.95 },
    visible: (i: number) => ({
        opacity: 1,
        filter: 'blur(0px)',
        scale: 1,
        transition: {
            duration: 0.4,
            delay: i * 0.1 + 1.5,
            ease: [0.22, 1, 0.36, 1],
        }
    }),
    exit: {
        opacity: 0,
        filter: 'blur(8px)',
        scale: 0.98,
        transition: {
            duration: 0.25,
            ease: 'easeOut',
        }
    }
};

// Card variants without layout animation to prevent shift
const cardRevealVariants: Variants = {
    hidden: { opacity: 0, filter: 'blur(16px)', scale: 0.95 },
    visible: (i: number) => ({
        opacity: 1,
        filter: 'blur(0px)',
        scale: 1,
        transition: {
            duration: 0.4,
            delay: i * 0.1 + 1.3, // After input card (0.9 + 0.4 duration)
            ease: [0.22, 1, 0.36, 1],
        }
    }),
    exit: {
        opacity: 0,
        filter: 'blur(8px)',
        scale: 0.98,
        transition: {
            duration: 0.25,
            ease: 'easeOut',
        }
    }
};

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
    selectedModel,
    onSelectModel,
    onSendMessage,
    isLoading,
    webSearchEnabled,
    onWebSearchToggle,
    searchType,
    onSearchTypeChange,
    reasoningEnabled,
    onReasoningToggle,
    hasAttachments = false,
    isSidebarMinimized = false
}) => {
    const [suggestions, setSuggestions] = useState<SuggestionCard[]>(() => getRandomSuggestions(3));
    const [refreshKey, setRefreshKey] = useState(0);
    const { user } = useAuth();

    // Memoize greeting to prevent recalculation on every render
    const greeting = useMemo(() => getTimeBasedGreeting(), []);

    // Get user's first name for personalized greeting
    const displayName = user?.firstName || 'there';

    const refreshSuggestions = () => {
        setRefreshKey(prev => prev + 1);
        setSuggestions(getRandomSuggestions(3));
    };

    // Memoize suggestions rendering to prevent unnecessary re-renders
    const memoizedSuggestions = useMemo(() => suggestions, [refreshKey]);

    return (
        <>
            {/* MOBILE Welcome Layout */}
            <div className="md:hidden flex flex-col h-full overflow-hidden">
                {/* Top Section - Greeting */}
                <div className={`flex flex-col items-center justify-start text-center px-4 shrink-0 transition-all duration-300 ${hasAttachments ? 'pt-10 pb-2' : 'pt-12 pb-4'}`}>
                    <motion.div
                        variants={greetingVariants}
                        initial="hidden"
                        animate="visible"
                        className="flex flex-col items-center w-full max-w-sm"
                    >
                        <div className="relative mb-3 w-[80px] h-[80px]">
                            <motion.img
                                variants={logoVariants}
                                src={new URL('../atoms/branding/zeta.png', import.meta.url).href}
                                alt="Zeta Logo"
                                style={{ top: '-5%', left: '57%', transform: 'translateX(-50%)' }}
                                className="absolute w-[118px] h-auto object-contain max-w-none"
                            />
                            <motion.div
                                className="absolute z-10"
                                style={{ top: '10.2rem', right: '-6.5rem' }}
                                variants={pillVariants}
                            >
                                <BadgePill>Beta</BadgePill>
                            </motion.div>
                        </div>
                        <motion.h1 variants={titleVariants} className="text-[42px] text-slate-800 mb-1 tracking-tight font-display leading-[1.1] px-2">
                            {greeting}, <span className="italic">{displayName}!</span>
                        </motion.h1>
                        <motion.p variants={descVariants} className="text-slate-600 text-[15px] max-w-xs font-medium leading-relaxed px-2">
                            We landed here — to transform your perspectives not just works.
                        </motion.p>
                    </motion.div>
                </div>

                {/* Middle Section - Input Card */}
                <div className="flex flex-col items-center shrink-0">
                    <motion.div
                        className="w-full px-0"
                        style={{
                            maxWidth: 'min(480px, calc(100vw - 24px))'
                        }}
                        initial={{ opacity: 0, y: 20, filter: 'blur(16px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        transition={{
                            duration: 0.6,
                            delay: 0.9,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                    >
                        {/* Architectural Layer - Multi-rim depth effect for mobile */}
                        <div className="p-1 bg-gradient-to-b from-white to-slate-300 rounded-[22px] shadow-sm">
                            <div className="p-1 bg-slate-100 rounded-[20px] shadow-inner">
                                <div className="bg-gradient-to-b from-white to-[#F5F5F5] rounded-[18px] overflow-hidden border border-white" style={{ boxShadow: "0 8px 10px rgba(0, 0, 0, 0.1), 0 4px 4px rgba(0, 0, 0, 0.04)" }}>
                                    <div className="bg-transparent px-4 pt-3 pb-2 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-transparent flex items-center justify-center flex-shrink-0 relative shadow-[0_5px_8px_rgba(0,0,0,0.35)]">
                                                <img
                                                    src={new URL('../atoms/branding/orb.png', import.meta.url).href}
                                                    alt="AI"
                                                    className="absolute -top-[6px] inset-0 w-full h-full object-cover"
                                                    style={{ transform: 'scale(2.25)' }}
                                                />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-slate-700">We are Live!</span>
                                                <span className="text-[10px] text-slate-400">Work with Gemini and Groq</span>
                                            </div>
                                        </div>
                                        <ModelPicker
                                            selectedModel={selectedModel}
                                            onSelectModel={onSelectModel}
                                            size="default"
                                            menuAlign="right"
                                        />
                                    </div>
                                    <div className="bg-white rounded-[14px] shadow-sm border border-slate-100 m-1"
                                        style={{ boxShadow: "rgb(71 144 202 / 16%) 0px 10px 10px, rgba(255, 255, 255, 0.4) 0px 1px 0px inset" }}>
                                        <ChatInput
                                            onSend={onSendMessage}
                                            disabled={isLoading}
                                            variant="embedded"
                                            selectedModel={selectedModel}
                                            onModelChange={onSelectModel}
                                            webSearchEnabled={webSearchEnabled}
                                            onWebSearchToggle={onWebSearchToggle}
                                            searchType={searchType}
                                            onSearchTypeChange={onSearchTypeChange}
                                            reasoningEnabled={reasoningEnabled}
                                            onReasoningToggle={onReasoningToggle}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Mobile Suggestions */}
                <div className={`flex flex-col gap-2 w-full flex-1 min-h-0 ${hasAttachments ? 'mt-4' : 'mt-3'}`}>
                    <div
                        key={`mobile-container-${refreshKey}`}
                        ref={(el) => {
                            if (el) {
                                const cardWidth = 200;
                                const gap = 12;
                                const scrollTo = cardWidth + gap;
                                setTimeout(() => {
                                    el.scrollTo({ left: scrollTo, behavior: 'instant' });
                                }, 100);
                            }
                        }}
                        className="flex gap-3 overflow-x-auto py-4 scrollbar-hide snap-x snap-mandatory w-full"
                        style={{
                            paddingLeft: 'calc(50vw - 100px)',
                            paddingRight: 'calc(50vw - 100px)',
                        }}
                    >
                        <AnimatePresence mode="wait">
                            {memoizedSuggestions.map((card, index) => (
                                <motion.div
                                    key={`mobile-${refreshKey}-${card.title}`}
                                    custom={index}
                                    variants={mobileCardVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    className="flex-shrink-0 snap-center"
                                    style={{ width: '200px' }}
                                >
                                    <ClayCard
                                        title={card.title}
                                        description={card.description}
                                        onClick={() => onSendMessage(card.prompt)}
                                        className="h-full text-xs"
                                    />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                    <div className="flex justify-center px-4 mt-2">
                        <motion.div
                            initial={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                            transition={{
                                duration: 0.4,
                                delay: 2.0,
                                ease: [0.22, 1, 0.36, 1]
                            }}
                        >
                            <ClayButton
                                label="Need an Idea starters?"
                                onClick={refreshSuggestions}
                                className="text-[10px] !py-1.5 !px-3"
                            />
                        </motion.div>
                    </div>
                </div>

            </div>

            {/* DESKTOP Greeting Section */}
            <motion.div
                variants={greetingVariants}
                initial="hidden"
                animate="visible"
                className="flex-col items-center text-center shrink-0 hidden md:flex"
            >
                <div className="relative mb-6 w-[96px] h-[96px]">
                    <motion.img
                        variants={logoVariants}
                        src={new URL('../atoms/branding/zeta.png', import.meta.url).href}
                        alt="Zeta Logo"
                        style={{ top: '-5%', left: '57%', transform: 'translateX(-50%)' }}
                        className="absolute w-[185px] h-auto object-contain max-w-none"
                    />
                    <motion.div
                        className="absolute z-10"
                        style={{ top: '12rem', right: '-15rem' }}
                        variants={pillVariants}
                    >
                        <BadgePill>Beta</BadgePill>
                    </motion.div>
                </div>
                <motion.h1 variants={titleVariants} className="text-[72px] text-slate-800 mb-0 tracking-tight font-display leading-[1.1] px-4">
                    {greeting}, <span className="italic">{displayName}!</span>
                </motion.h1>
                <motion.p variants={descVariants} className="text-slate-600 text-[16px] max-w-2xl font-medium leading-relaxed px-6">
                    We landed here — to transform your perspectives not just works.
                </motion.p>
            </motion.div>

            {/* Desktop Suggestions - positioned below the input card */}
            <div
                className={`w-full flex-col gap-1 shrink-0 px-1 mb-1 z-0 hidden md:flex transition-all duration-300 ease-out ${hasAttachments ? 'mt-[19rem]' : 'mt-[16rem]'}`}
                style={{
                    maxWidth: isSidebarMinimized
                        ? 'min(675px, calc(100vw - 70px - 80px))'
                        : 'min(600px, calc(100vw - 240px - 80px))'
                }}
            >
                <div className="grid grid-cols-3 gap-2 md:gap-4 w-full">
                    <AnimatePresence mode="wait">
                        {memoizedSuggestions.map((card, index) => (
                            <motion.div
                                key={`${refreshKey}-${card.title}`}
                                custom={index}
                                variants={cardRevealVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                            >
                                <ClayCard
                                    title={card.title}
                                    description={card.description}
                                    onClick={() => onSendMessage(card.prompt)}
                                    className="w-full h-full text-xs md:text-sm"
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
                <div className="flex justify-center mt-4 px-3">
                    <motion.div
                        initial={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        transition={{
                            duration: 0.4,
                            delay: 1.9, // After all 3 cards finish (1.3 + 0.2 stagger + 0.4 duration)
                            ease: [0.22, 1, 0.36, 1]
                        }}
                    >
                        <ClayButton
                            label="Need an Idea starters?"
                            onClick={refreshSuggestions}
                            className="text-[10px] md:text-xs !py-2 !px-4"
                        />
                    </motion.div>
                </div>

            </div>
        </>
    );
};

export default WelcomeScreen;
