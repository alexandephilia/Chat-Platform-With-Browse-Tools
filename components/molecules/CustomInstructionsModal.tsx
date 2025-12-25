import { AnimatePresence, motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { AlertCircle, Sparkles, X } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface CustomInstructionsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// Check mobile once at module level to avoid re-renders
const getIsMobile = () => typeof window !== 'undefined' && window.innerWidth < 640;

export const CustomInstructionsModal: React.FC<CustomInstructionsModalProps> = ({ isOpen, onClose }) => {
    const [instructions, setInstructions] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const dragY = useMotionValue(0);
    const sheetRef = useRef<HTMLDivElement>(null);

    // Capture isMobile at mount time and when modal opens to prevent re-render issues during animation
    const isMobileRef = useRef(getIsMobile());

    // Update ref only when modal opens (not during animation)
    useEffect(() => {
        if (isOpen) {
            isMobileRef.current = getIsMobile();
            dragY.set(0);
        }
    }, [isOpen, dragY]);

    // Use the ref value for animations - this won't cause re-renders
    const isMobile = isMobileRef.current;

    useEffect(() => {
        if (isOpen) {
            const saved = localStorage.getItem('zeta_custom_instructions');
            if (saved) setInstructions(saved);
        }
    }, [isOpen]);

    const handleSave = () => {
        setIsSaving(true);
        localStorage.setItem('zeta_custom_instructions', instructions);
        setTimeout(() => {
            setIsSaving(false);
            onClose();
        }, 800);
    };

    const handleModalClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        e.stopPropagation();
    }, []);

    const handleDragEnd = useCallback((_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const shouldClose = info.velocity.y > 500 || (info.velocity.y >= 0 && info.offset.y > 150);
        if (shouldClose) {
            onClose();
        } else {
            dragY.set(0);
        }
    }, [onClose, dragY]);

    // Transform values for drag interaction
    const backdropOpacity = useTransform(dragY, [0, 300], [1, 0]);
    const sheetBlurFilter = useTransform(dragY, [0, 300], ['blur(0px)', 'blur(8px)']);

    // Memoize animation variants to prevent recalculation
    const mobileVariants = useMemo(() => ({
        initial: { y: '100%' },
        animate: { y: 0 },
        exit: { y: '100%' }
    }), []);

    const desktopVariants = useMemo(() => ({
        initial: { opacity: 0, scale: 0.95, y: 20 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.95, y: 20 }
    }), []);

    const mobileTransition = useMemo(() => ({
        duration: 0.35,
        ease: [0.32, 0.72, 0, 1]
    }), []);

    const desktopTransition = useMemo(() => ({
        duration: 0.2,
        ease: [0.4, 0, 0.2, 1]
    }), []);

    return (
        <AnimatePresence mode="wait">
            {isOpen && (
                <div className="fixed inset-0 z-[10002] flex items-end sm:items-center justify-center">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={isMobile ? { opacity: backdropOpacity } : undefined}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                    />

                    <motion.div
                        ref={sheetRef}
                        variants={isMobile ? mobileVariants : desktopVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={isMobile ? mobileTransition : desktopTransition}
                        drag={isMobile ? 'y' : false}
                        dragConstraints={{ top: 0, bottom: 0 }}
                        dragElastic={{ top: 0, bottom: 0.3 }}
                        onDragEnd={handleDragEnd}
                        style={isMobile ? {
                            y: dragY,
                            filter: sheetBlurFilter
                        } : undefined}
                        onClick={handleModalClick}
                        onTouchEnd={handleModalClick}
                        className="relative w-full sm:max-w-lg bg-[rgb(250,250,250)] rounded-t-[24px] sm:rounded-[24px] shadow-[0_-8px_32px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.9)] overflow-hidden border border-slate-200/60 max-h-[90vh] sm:max-h-[85vh] flex flex-col touch-none sm:touch-auto"
                    >
                        <div className="sm:hidden flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing">
                            <div className="w-10 h-1 bg-slate-300 rounded-full" />
                        </div>

                        <div className="px-5 sm:px-8 py-4 sm:py-6 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-2.5 sm:gap-3">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-b from-white to-slate-50 flex items-center justify-center text-blue-500 shadow-[0_8px_16px_-4px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,1)] border border-transparent">
                                    <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-md sm:rounded-lg bg-slate-50 flex items-center justify-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]">
                                        <Sparkles size={14} className="sm:hidden text-blue-500" />
                                        <Sparkles size={16} className="hidden sm:block text-blue-500" />
                                    </div>
                                </div>
                                <h2 className="text-base sm:text-xl font-bold text-slate-800">Custom Instructions</h2>
                            </div>
                            <button onClick={onClose} className="p-1.5 sm:p-2 hover:bg-slate-100 active:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                                <X size={18} className="sm:hidden" />
                                <X size={20} className="hidden sm:block" />
                            </button>
                        </div>

                        <div
                            className="px-5 sm:px-8 pb-5 sm:pb-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1 touch-auto"
                            onPointerDownCapture={(e) => e.stopPropagation()}
                        >
                            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                                Share anything you'd like Zeta to know about you or your preferences. This helps the AI provide more personalized responses.
                            </p>

                            <div className="relative group">
                                <textarea
                                    value={instructions}
                                    onChange={(e) => setInstructions(e.target.value)}
                                    placeholder="e.g. 'I prefer concise answers', 'Always provide code examples in TypeScript'..."
                                    className="w-full h-36 sm:h-48 p-4 sm:p-5 text-sm bg-slate-50 border border-slate-200/60 rounded-xl sm:rounded-2xl focus:outline-none transition-all resize-none text-slate-700 placeholder:text-slate-400 shadow-[inset_0_6px_10px_rgba(0,0,0,0.1)]"
                                />
                                <div className="absolute right-3 sm:right-4 bottom-3 sm:bottom-4 pointer-events-none opacity-20 group-focus-within:opacity-40 transition-opacity">
                                    <Sparkles size={32} className="sm:hidden text-blue-500/40" />
                                    <Sparkles size={40} className="hidden sm:block text-blue-500/40" />
                                </div>
                            </div>

                            <div className="flex items-start gap-2.5 sm:gap-3 p-3 sm:p-4 bg-blue-50/50 rounded-xl sm:rounded-2xl border border-blue-100/50">
                                <AlertCircle size={16} className="text-blue-400 flex-shrink-0 mt-0.5" />
                                <p className="text-[10px] sm:text-[11px] text-blue-500/70 leading-normal">
                                    These instructions will be applied to all new conversations you start with Zeta.
                                </p>
                            </div>
                        </div>

                        <div className="px-5 sm:px-6 py-4 sm:py-6 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3 sm:gap-4 shrink-0">
                            <button onClick={onClose} className="px-4 sm:px-6 py-2 sm:py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-800 active:text-slate-900 transition-colors">
                                Cancel
                            </button>
                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                onClick={handleSave}
                                disabled={isSaving}
                                className={`relative px-6 sm:px-8 py-2 sm:py-2.5 rounded-xl text-white text-sm font-bold overflow-hidden bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 shadow-[0_8px_16px_rgba(37,99,235,0.25),inset_0_2px_4px_rgba(255,255,255,0.4)] flex items-center gap-2 min-w-[120px] sm:min-w-[140px] justify-center active:shadow-[0_4px_8px_rgba(37,99,235,0.2)] ${isSaving ? 'opacity-70 cursor-wait' : ''}`}
                            >
                                <span className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                                {isSaving ? (
                                    <>
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                                        />
                                        Saving...
                                    </>
                                ) : 'Save Changes'}
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
