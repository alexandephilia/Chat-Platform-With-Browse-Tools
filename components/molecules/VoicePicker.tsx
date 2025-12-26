/**
 * VoicePicker - Dropdown to select TTS model and voice
 * Two-level menu: Model (Zeta V1/V2) -> Voice
 */

import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, ChevronRight } from 'lucide-react';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
    ELEVENLABS_VOICES_V1,
    ELEVENLABS_VOICES_V2,
    getSelectedTTSModel,
    getSelectedVoice,
    getVoicesByGender,
    setSelectedTTSModel,
    setSelectedVoice,
    TTS_MODELS,
    TTSModelKey,
    VoiceInfo,
    VoiceKey
} from '../../services/elevenLabsService';
import v1IconImg from '../atoms/branding/orbv1.png';
import voiceIconImg from '../atoms/branding/voice.png';

// Color filters for different voices (hue-rotate values)
const VOICE_COLORS: Record<VoiceKey, string> = {
    // Female voices - warmer/cooler tones
    alice: 'hue-rotate(200deg) saturate(1.2)',      // Blue
    aria: 'hue-rotate(280deg) saturate(1.3)',       // Purple
    charlotte: 'hue-rotate(320deg) saturate(1.2)',  // Pink
    jessica: 'hue-rotate(30deg) saturate(1.3)',     // Orange
    laura: 'hue-rotate(60deg) saturate(1.2)',       // Yellow-green
    lily: 'hue-rotate(140deg) saturate(1.2)',       // Teal
    matilda: 'hue-rotate(180deg) saturate(1.2)',    // Cyan
    sarah: 'hue-rotate(240deg) saturate(1.2)',      // Indigo
    // Male voices - different tones
    bill: 'hue-rotate(0deg) saturate(1.3)',         // Red
    brian: 'hue-rotate(20deg) saturate(1.2)',       // Orange-red
    callum: 'hue-rotate(100deg) saturate(1.2)',     // Green
    charlie: 'hue-rotate(120deg) saturate(1.3)',    // Lime
    chris: 'hue-rotate(160deg) saturate(1.2)',      // Aqua
    daniel: 'hue-rotate(220deg) saturate(1.2)',     // Blue
    eric: 'hue-rotate(260deg) saturate(1.2)',       // Violet
    george: 'hue-rotate(300deg) saturate(1.2)',     // Magenta
    liam: 'hue-rotate(340deg) saturate(1.2)',       // Rose
    roger: 'hue-rotate(40deg) saturate(1.3)',       // Gold
    will: 'hue-rotate(80deg) saturate(1.2)',        // Yellow-green
    // Non-binary
    river: 'hue-rotate(190deg) saturate(1.4)',      // Turquoise
};

interface VoicePickerProps {
    onVoiceChange?: (voiceKey: VoiceKey) => void;
    onModelChange?: (modelKey: TTSModelKey) => void;
    size?: 'default' | 'small';
    menuAlign?: 'left' | 'right';
}

const VoicePicker: React.FC<VoicePickerProps> = ({
    onVoiceChange,
    onModelChange,
    size = 'small',
    menuAlign = 'left'
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeModel, setActiveModel] = useState<TTSModelKey | null>(null);
    const [selectedVoice, setSelectedVoiceState] = useState<VoiceKey>(getSelectedVoice());
    const [selectedModel, setSelectedModelState] = useState<TTSModelKey>(getSelectedTTSModel());
    const [menuPosition, setMenuPosition] = useState<{ x: number; y: number; placement: 'top' | 'bottom' } | null>(null);
    const [submenuPosition, setSubmenuPosition] = useState<{ x: number; y: number } | null>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const mainMenuRef = useRef<HTMLDivElement>(null);
    const modelItemRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
    const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const touchHandledRef = useRef(false);

    const voicesByGender = useMemo(() => getVoicesByGender(selectedModel), [selectedModel]);
    const currentVoices = selectedModel === 'zeta-v2' ? ELEVENLABS_VOICES_V2 : ELEVENLABS_VOICES_V1;
    const currentVoice = currentVoices[selectedVoice];

    // Helper to create mobile-friendly button handlers
    const createTapHandler = useCallback((handler: () => void) => ({
        onClick: (e: React.MouseEvent) => {
            if (touchHandledRef.current) {
                touchHandledRef.current = false;
                return;
            }
            e.preventDefault();
            handler();
        },
        onTouchEnd: (e: React.TouchEvent) => {
            e.preventDefault();
            e.stopPropagation();
            touchHandledRef.current = true;
            handler();
            setTimeout(() => { touchHandledRef.current = false; }, 300);
        }
    }), []);

    const handleOpen = useCallback(() => {
        if (!triggerRef.current) return;

        const rect = triggerRef.current.getBoundingClientRect();
        const menuHeight = 120;
        const menuWidth = 160;
        const padding = 12;
        const isMobile = window.innerWidth < 640;

        // Calculate available space
        const spaceBelow = window.innerHeight - rect.bottom - padding;
        const spaceAbove = rect.top - padding;

        // Use same logic as ModelPicker - prefer top when not enough space below
        const placement: 'top' | 'bottom' = spaceBelow < menuHeight && spaceAbove > spaceBelow ? 'top' : 'bottom';

        let x: number;
        if (isMobile) {
            // Center on mobile
            x = Math.max(padding, (window.innerWidth - menuWidth) / 2);
        } else if (menuAlign === 'right') {
            x = rect.right - menuWidth;
        } else {
            x = rect.left;
        }

        if (x + menuWidth > window.innerWidth - padding) {
            x = Math.max(padding, window.innerWidth - menuWidth - padding);
        }
        if (x < padding) {
            x = padding;
        }

        setMenuPosition({
            x,
            y: placement === 'bottom' ? rect.bottom + 4 : rect.top - 4,
            placement
        });
        setIsOpen(true);
    }, [menuAlign]);

    const calculatePosition = useCallback(() => {
        if (!triggerRef.current || !isOpen) return;

        const rect = triggerRef.current.getBoundingClientRect();
        const menuHeight = 120;
        const menuWidth = 160;
        const padding = 12;

        const spaceBelow = window.innerHeight - rect.bottom - padding;
        const spaceAbove = rect.top - padding;
        const placement: 'top' | 'bottom' = spaceBelow < menuHeight && spaceAbove > spaceBelow ? 'top' : 'bottom';

        let x: number;
        if (menuAlign === 'right') {
            x = rect.right - menuWidth;
        } else {
            x = rect.left;
        }

        if (x + menuWidth > window.innerWidth - padding) {
            x = Math.max(padding, window.innerWidth - menuWidth - padding);
        }
        if (x < padding) {
            x = padding;
        }

        setMenuPosition({
            x,
            y: placement === 'bottom' ? rect.bottom + 4 : rect.top - 4,
            placement
        });
    }, [menuAlign, isOpen]);

    const calculateSubmenuPosition = useCallback((modelKey: TTSModelKey) => {
        const modelEl = modelItemRefs.current.get(modelKey);
        if (!modelEl || !menuPosition) return;

        const rect = modelEl.getBoundingClientRect();
        const submenuWidth = 200;
        const submenuHeight = 320;
        const padding = 8;
        const gap = 4; // Small gap between menus
        const isMobile = window.innerWidth < 640;

        let x: number;
        let y: number;

        if (isMobile) {
            // On mobile, stack vertically - submenu appears directly above or below main menu
            x = Math.max(padding, (window.innerWidth - submenuWidth) / 2);

            // Get actual main menu bounds if available
            const mainMenuRect = mainMenuRef.current?.getBoundingClientRect();

            if (mainMenuRect) {
                // Use actual menu position
                if (menuPosition.placement === 'top') {
                    // Main menu is above button, submenu goes above it
                    y = mainMenuRect.top - submenuHeight - gap;
                    if (y < padding) {
                        y = mainMenuRect.bottom + gap;
                    }
                } else {
                    // Main menu is below button, submenu goes below it
                    y = mainMenuRect.bottom + gap;
                    if (y + submenuHeight > window.innerHeight - padding) {
                        y = mainMenuRect.top - submenuHeight - gap;
                    }
                }
            } else {
                // Fallback to estimated position
                const mainMenuHeight = 120;
                if (menuPosition.placement === 'top') {
                    y = menuPosition.y - mainMenuHeight - submenuHeight - gap;
                    if (y < padding) {
                        y = menuPosition.y + gap;
                    }
                } else {
                    y = menuPosition.y + mainMenuHeight + gap;
                    if (y + submenuHeight > window.innerHeight - padding) {
                        y = menuPosition.y - submenuHeight - gap;
                    }
                }
            }
        } else {
            // Desktop: position to the right of the menu item
            x = rect.right + 4;
            if (x + submenuWidth > window.innerWidth - padding) {
                x = rect.left - submenuWidth - 4;
            }

            // Align submenu top with the menu item
            y = rect.top - 4;
            if (y + submenuHeight > window.innerHeight - padding) {
                y = window.innerHeight - submenuHeight - padding;
            }
            if (y < padding) {
                y = padding;
            }
        }

        setSubmenuPosition({ x, y });
    }, [menuPosition?.y, menuPosition?.placement]);

    // Recalculate position on resize only (not scroll - menus are fixed position)
    useEffect(() => {
        if (isOpen) {
            window.addEventListener('resize', calculatePosition);
            return () => {
                window.removeEventListener('resize', calculatePosition);
            };
        }
    }, [isOpen, calculatePosition]);

    useEffect(() => {
        if (activeModel) {
            calculateSubmenuPosition(activeModel);
        }
    }, [activeModel, calculateSubmenuPosition]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (closeTimeoutRef.current) {
                clearTimeout(closeTimeoutRef.current);
            }
        };
    }, []);

    const handleSelectVoice = useCallback((voiceKey: VoiceKey) => {
        if (activeModel) {
            setSelectedTTSModel(activeModel);
            setSelectedModelState(activeModel);
            onModelChange?.(activeModel);
        }
        setSelectedVoice(voiceKey);
        setSelectedVoiceState(voiceKey);
        onVoiceChange?.(voiceKey);
        setIsOpen(false);
        setActiveModel(null);
    }, [activeModel, onVoiceChange, onModelChange]);

    const handleClose = useCallback(() => {
        setIsOpen(false);
        setActiveModel(null);
        setMenuPosition(null);
        setSubmenuPosition(null);
    }, []);

    // Check if device uses touch (coarse pointer)
    const isTouchDevice = useCallback(() => {
        return window.matchMedia('(pointer: coarse)').matches;
    }, []);

    const handleSubmenuMouseLeave = useCallback(() => {
        // Don't auto-close on touch devices - only close via backdrop tap
        if (isTouchDevice()) return;

        closeTimeoutRef.current = setTimeout(() => {
            setActiveModel(null);
            setSubmenuPosition(null);
        }, 100);
    }, [isTouchDevice]);

    const handleSubmenuMouseEnter = useCallback(() => {
        if (isTouchDevice()) return;

        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = null;
        }
    }, [isTouchDevice]);

    const handleModelMouseEnter = useCallback((modelKey: TTSModelKey) => {
        // On touch devices, don't auto-open submenu on hover - require tap
        if (isTouchDevice()) return;

        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = null;
        }
        setActiveModel(modelKey);
    }, [isTouchDevice]);

    // Sync with localStorage on mount
    useEffect(() => {
        setSelectedVoiceState(getSelectedVoice());
        setSelectedModelState(getSelectedTTSModel());
    }, []);

    const isSmall = size === 'small';

    return (
        <>
            {/* Trigger Button - matches ModelPicker styling exactly */}
            <button
                ref={triggerRef}
                {...createTapHandler(() => isOpen ? handleClose() : handleOpen())}
                className={`
                    flex items-center transition-all duration-300 group relative touch-manipulation
                    ${isSmall
                        ? 'gap-1 px-1.5 py-0.5 rounded-md'
                        : 'gap-1.5 px-2 py-1 rounded-lg'
                    }
                    ${isOpen
                        ? 'bg-gradient-to-br from-white via-white to-slate-100 shadow-[0_2px_6px_-1px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,1)] border-slate-200/80'
                        : 'bg-slate-50/50 shadow-[inset_0_1px_3px_rgb(0_0_0_/_18%),_0_1px_0_rgba(255,255,255,0.8)] border-slate-200/40'
                    }
                    border hover:border-slate-300/60
                    active:scale-[0.98]
                `}
                title="Select TTS voice"
            >
                {/* Icon container - matches ModelPicker exactly */}
                <div className={`
                    flex items-center justify-center rounded overflow-hidden bg-slate-100
                    ${isSmall ? 'w-4 h-4' : 'w-10 h-10'}
                    shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)]
                `}>
                    <img
                        src={voiceIconImg}
                        alt="Voice"
                        className="w-full h-full object-cover antialiased"
                        style={{
                            filter: VOICE_COLORS[selectedVoice] || 'none',
                            imageRendering: 'smooth',
                            WebkitBackfaceVisibility: 'hidden',
                            backfaceVisibility: 'hidden'
                        }}
                        draggable={false}
                    />
                </div>

                <span className={`font-medium text-slate-600 leading-tight truncate ${isSmall ? 'text-[9px] max-w-[60px]' : 'text-[10px] max-w-[80px]'}`}>
                    {currentVoice.name}
                </span>

                <ChevronDown
                    size={isSmall ? 8 : 10}
                    className={`text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {/* Dropdown Menu - Portal */}
            {createPortal(
                <AnimatePresence mode="sync">
                    {isOpen && menuPosition && (
                        <>
                            {/* Backdrop */}
                            <motion.div
                                key="voice-picker-backdrop"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.1 }}
                                onClick={handleClose}
                                className="fixed inset-0 z-[9998]"
                            />

                            {/* Model Menu (First Level) */}
                            <motion.div
                                ref={mainMenuRef}
                                key="voice-picker-menu"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.15 }}
                                style={{
                                    position: 'fixed',
                                    left: menuPosition.x,
                                    ...(menuPosition.placement === 'bottom'
                                        ? { top: menuPosition.y }
                                        : { bottom: window.innerHeight - menuPosition.y }
                                    ),
                                    zIndex: 9999,
                                    transform: 'translateZ(0)',
                                    willChange: 'transform, opacity',
                                    background: 'rgb(250, 250, 250)'
                                }}
                                className="w-[160px] p-1 backdrop-blur-xl rounded-xl border border-slate-200/60 shadow-[0_8px_32px_rgba(0,0,0,0.12),0_4px_8px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9)]"
                                onTouchStart={(e) => e.stopPropagation()}
                                onTouchMove={(e) => e.stopPropagation()}
                                onTouchEnd={(e) => e.stopPropagation()}
                            >
                                <div className="px-2 py-0.5 mb-0.5">
                                    <span className="text-[11px] font-bold text-slate-400 tracking-wider">
                                        Voice Model
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    {(Object.keys(TTS_MODELS) as TTSModelKey[]).map((modelKey) => {
                                        const model = TTS_MODELS[modelKey];
                                        const isActive = activeModel === modelKey;
                                        const isSelected = selectedModel === modelKey;

                                        const isV2 = modelKey === 'zeta-v2';

                                        return (
                                            <button
                                                key={modelKey}
                                                ref={(el) => {
                                                    if (el) modelItemRefs.current.set(modelKey, el);
                                                }}
                                                onMouseEnter={() => handleModelMouseEnter(modelKey)}
                                                {...createTapHandler(() => setActiveModel(modelKey))}
                                                className={`
                                                    w-full flex items-center gap-2 px-2 py-1.5 rounded-lg
                                                    transition-all duration-300 group/item relative touch-manipulation
                                                    ${isActive
                                                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_1px_2px_rgba(59,130,246,0.1),0_0_0_1px_rgba(59,130,246,0.05)]'
                                                        : 'text-slate-500 hover:bg-slate-50/80 shadow-[inset_0_1px_1px_rgba(255,255,255,1),0_1px_2px_rgba(0,0,0,0.03),0_0_0_1px_rgba(0,0,0,0.02)]'
                                                    }
                                                `}
                                            >
                                                <div className="w-4 h-4 rounded-full transition-all duration-300 relative flex items-center justify-center shrink-0 shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] bg-slate-100 overflow-hidden">
                                                    <img
                                                        src={v1IconImg}
                                                        alt={model.name}
                                                        className="w-full h-full object-cover"
                                                        style={isV2 ? { filter: 'hue-rotate(220deg) saturate(1.2)' } : undefined}
                                                    />
                                                </div>

                                                <div className="flex-1 flex flex-col items-start min-w-0">
                                                    <span className={`text-[11px] font-medium ${isSelected ? 'text-blue-600' : 'text-slate-700'}`}>
                                                        {model.name}
                                                    </span>
                                                    <span className="text-[8px] text-slate-400">
                                                        {model.description}
                                                    </span>
                                                </div>

                                                <ChevronRight size={10} className="text-slate-400" />
                                            </button>
                                        );
                                    })}
                                </div>
                            </motion.div>

                            {/* Voice Submenu (Second Level) */}
                            {activeModel && submenuPosition && (
                                <motion.div
                                    key="voice-submenu"
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -8 }}
                                    transition={{ duration: 0.12 }}
                                    style={{
                                        position: 'fixed',
                                        left: submenuPosition.x,
                                        top: submenuPosition.y,
                                        zIndex: 10000,
                                        transform: 'translateZ(0)',
                                        willChange: 'transform, opacity',
                                        background: 'rgb(250, 250, 250)'
                                    }}
                                    className="w-[200px] p-1.5 backdrop-blur-xl rounded-xl border border-slate-200/60 shadow-[0_8px_32px_rgba(0,0,0,0.12),0_4px_8px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] max-h-[320px] overflow-y-auto overscroll-contain"
                                    onMouseEnter={!isTouchDevice() ? handleSubmenuMouseEnter : undefined}
                                    onMouseLeave={!isTouchDevice() ? handleSubmenuMouseLeave : undefined}
                                    onTouchStart={(e) => e.stopPropagation()}
                                    onTouchMove={(e) => e.stopPropagation()}
                                    onTouchEnd={(e) => e.stopPropagation()}
                                >
                                    {(() => {
                                        const modelVoices = getVoicesByGender(activeModel);
                                        return (
                                            <>
                                                {/* Female voices */}
                                                <div className="mb-2">
                                                    <div className="px-2 py-1">
                                                        <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                                                            Female
                                                        </span>
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        {modelVoices.female.map(({ key, info }) => (
                                                            <VoiceOption
                                                                key={key}
                                                                voiceKey={key}
                                                                info={info}
                                                                isSelected={selectedVoice === key && selectedModel === activeModel}
                                                                onSelect={handleSelectVoice}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Male voices */}
                                                <div className="mb-2">
                                                    <div className="px-2 py-1">
                                                        <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                                                            Male
                                                        </span>
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        {modelVoices.male.map(({ key, info }) => (
                                                            <VoiceOption
                                                                key={key}
                                                                voiceKey={key}
                                                                info={info}
                                                                isSelected={selectedVoice === key && selectedModel === activeModel}
                                                                onSelect={handleSelectVoice}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Non-binary voices */}
                                                {modelVoices['non-binary'].length > 0 && (
                                                    <div>
                                                        <div className="px-2 py-1">
                                                            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                                                                Non-binary
                                                            </span>
                                                        </div>
                                                        <div className="space-y-0.5">
                                                            {modelVoices['non-binary'].map(({ key, info }) => (
                                                                <VoiceOption
                                                                    key={key}
                                                                    voiceKey={key}
                                                                    info={info}
                                                                    isSelected={selectedVoice === key && selectedModel === activeModel}
                                                                    onSelect={handleSelectVoice}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        );
                                    })()}
                                </motion.div>
                            )}
                        </>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    );
};

// Individual voice option component with scroll-aware touch handling
const VoiceOption = memo(({
    voiceKey,
    info,
    isSelected,
    onSelect
}: {
    voiceKey: VoiceKey;
    info: VoiceInfo;
    isSelected: boolean;
    onSelect: (key: VoiceKey) => void;
}) => {
    const touchStartRef = useRef<{ y: number; time: number } | null>(null);
    const isScrollingRef = useRef(false);
    const colorFilter = VOICE_COLORS[voiceKey] || 'hue-rotate(0deg)';

    const SCROLL_THRESHOLD = 10; // pixels moved to consider it a scroll
    const TAP_MAX_DURATION = 300; // max ms for a tap

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        const touch = e.touches[0];
        touchStartRef.current = { y: touch.clientY, time: Date.now() };
        isScrollingRef.current = false;
    }, []);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (!touchStartRef.current) return;

        const touch = e.touches[0];
        const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);

        // If moved more than threshold, it's a scroll not a tap
        if (deltaY > SCROLL_THRESHOLD) {
            isScrollingRef.current = true;
        }
    }, []);

    const handleTouchEnd = useCallback((e: React.TouchEvent) => {
        // Don't prevent default - let scroll momentum continue
        e.stopPropagation();

        const wasScrolling = isScrollingRef.current;
        const touchStart = touchStartRef.current;
        const tapDuration = touchStart ? Date.now() - touchStart.time : Infinity;

        // Reset refs
        touchStartRef.current = null;
        isScrollingRef.current = false;

        // Only select if it was a genuine tap (not scrolling, short duration)
        if (!wasScrolling && tapDuration < TAP_MAX_DURATION) {
            onSelect(voiceKey);
        }
    }, [onSelect, voiceKey]);

    const handleClick = useCallback((e: React.MouseEvent) => {
        // For mouse/desktop clicks
        e.preventDefault();
        onSelect(voiceKey);
    }, [onSelect, voiceKey]);

    return (
        <button
            onClick={handleClick}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className={`
                w-full flex items-center gap-2 px-2 py-1.5 rounded-lg
                transition-all duration-300 group/item touch-manipulation select-none
                ${isSelected
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_1px_2px_rgba(59,130,246,0.1),0_0_0_1px_rgba(59,130,246,0.05)]'
                    : 'text-slate-500 hover:bg-slate-50/80 shadow-[inset_0_1px_1px_rgba(255,255,255,1),0_1px_2px_rgba(0,0,0,0.03),0_0_0_1px_rgba(0,0,0,0.02)]'
                }
            `}
        >
            <div className="w-8 h-8 rounded-full transition-all duration-300 relative flex items-center justify-center shrink-0 shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] bg-slate-100 overflow-hidden">
                <img
                    src={voiceIconImg}
                    alt=""
                    className="w-full h-full object-cover"
                    style={{ filter: colorFilter }}
                    draggable={false}
                />
            </div>

            <div className="flex-1 flex flex-col items-start min-w-0">
                <div className="flex items-center gap-1">
                    <span className={`text-[11px] font-medium truncate ${isSelected ? 'text-blue-600' : 'text-slate-700'}`}>
                        {info.name}
                    </span>
                </div>
                <span className="text-[8px] text-slate-400 truncate w-full text-left">
                    {info.accent} · {info.style}
                </span>
            </div>

            {isSelected && (
                <div className="w-3.5 h-3.5 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-[inset_0_1px_2px_rgba(255,255,255,0.2),0_1px_3px_rgba(37,99,235,0.5),0_0.5px_1px_rgba(37,99,235,0.6)]">
                    <Check size={8} className="text-white drop-shadow-[0_0.8px_1px_rgba(0,0,0,0.5)]" strokeWidth={3} />
                </div>
            )}
        </button>
    );
});

export default memo(VoicePicker);
