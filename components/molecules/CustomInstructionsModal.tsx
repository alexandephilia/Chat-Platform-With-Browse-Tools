import { AnimatePresence, motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';

const AtomOutline = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
        <path fill="currentColor" fillRule="evenodd" d="M13.462 4.047c1.203.822 2.4 1.812 3.54 2.951a24.928 24.928 0 0 1 2.951 3.54c.701-1.377 1.123-2.682 1.253-3.813c.165-1.427-.138-2.482-.794-3.137c-.655-.656-1.71-.96-3.137-.794c-1.131.13-2.436.552-3.813 1.253ZM20.869 12c1.005-1.765 1.645-3.524 1.828-5.103c.195-1.69-.13-3.275-1.224-4.37c-1.095-1.095-2.68-1.419-4.37-1.224c-1.58.183-3.338.823-5.103 1.828c-1.765-1.005-3.523-1.645-5.103-1.827c-1.69-.195-3.275.128-4.37 1.223c-1.094 1.095-1.418 2.68-1.223 4.37c.182 1.58.822 3.338 1.828 5.103c-1.006 1.765-1.646 3.523-1.828 5.103c-.195 1.69.129 3.274 1.224 4.37c1.095 1.094 2.679 1.418 4.37 1.223c1.579-.182 3.337-.822 5.102-1.828c1.765 1.006 3.523 1.646 5.103 1.828c1.69.195 3.275-.129 4.37-1.224c1.095-1.095 1.418-2.679 1.223-4.37c-.182-1.579-.822-3.337-1.827-5.102Zm-1.75 0a23 23 0 0 0-3.178-3.941A23 23 0 0 0 12 4.88a23 23 0 0 0-3.94 3.18A22.998 22.998 0 0 0 4.88 12a23.004 23.004 0 0 0 3.18 3.942A23 23 0 0 0 12 19.119a22.995 22.995 0 0 0 3.941-3.179A23 23 0 0 0 19.12 12Zm-5.657 7.953a24.937 24.937 0 0 0 3.54-2.952a24.937 24.937 0 0 0 2.951-3.54c.701 1.378 1.123 2.682 1.253 3.814c.165 1.427-.138 2.481-.794 3.137c-.656.655-1.71.959-3.137.794c-1.131-.13-2.436-.552-3.813-1.253Zm-2.924 0A24.928 24.928 0 0 1 6.998 17a24.933 24.933 0 0 1-2.951-3.54c-.7 1.378-1.122 2.682-1.253 3.814c-.164 1.427.139 2.481.794 3.137c.656.655 1.71.958 3.137.794c1.132-.13 2.436-.552 3.813-1.253Zm-6.491-9.415a24.935 24.935 0 0 1 2.952-3.54a24.933 24.933 0 0 1 3.54-2.951C9.16 3.346 7.856 2.924 6.724 2.794c-1.427-.165-2.481.138-3.137.794c-.655.655-.959 1.71-.794 3.137c.13 1.131.552 2.436 1.253 3.813ZM12 10.25a1.75 1.75 0 1 0 0 3.5a1.75 1.75 0 0 0 0-3.5ZM8.75 12a3.25 3.25 0 1 1 6.5 0a3.25 3.25 0 0 1-6.5 0Z" clipRule="evenodd"></path>
    </svg>
);

import React, { useCallback, useEffect, useRef, useState } from 'react';

interface CustomInstructionsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CustomInstructionsModal: React.FC<CustomInstructionsModalProps> = ({ isOpen, onClose }) => {
    const [instructions, setInstructions] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const dragY = useMotionValue(0);
    const sheetRef = useRef<HTMLDivElement>(null);

    // Track isMobile state - lock it when modal opens to prevent mid-animation variant switches
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Lock the isMobile state when modal opens to ensure consistent animation
    useEffect(() => {
        if (isOpen) {
            dragY.set(0);
            const saved = localStorage.getItem('zeta_custom_instructions');
            if (saved) setInstructions(saved);
        }
    }, [isOpen, dragY]);

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

    const handleDragEnd = useCallback((_: any, info: PanInfo) => {
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

    // Use the locked state for animation consistency
    const currentVariants = isMobile ? {
        initial: { y: '100vh', opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: '100vh', opacity: 0 }
    } : {
        initial: { y: 20, opacity: 0, scale: 0.95, filter: 'blur(10px)' },
        animate: { y: 0, opacity: 1, scale: 1, filter: 'blur(0px)' },
        exit: { y: 10, opacity: 0, scale: 0.98, filter: 'blur(8px)' }
    };

    const currentTransition = isMobile ? {
        duration: 0.4,
        ease: [0.32, 0.72, 0, 1] // Native-style smooth ease
    } : {
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1]
    };

    return (
        <AnimatePresence mode="wait">
            {isOpen && (
                <motion.div
                    key="instructions-modal-wrapper"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className={`fixed inset-0 z-[10002] flex ${isMobile ? 'items-end' : 'items-center'} justify-center`}
                >
                    {/* Backdrop */}
                    <motion.div
                        key="modal-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={isMobile ? { opacity: backdropOpacity } : undefined}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                    />

                    {/* Modal Content with Multi-rim depth effect */}
                    <motion.div
                        key="modal-content"
                        ref={sheetRef}
                        variants={currentVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={isMobile ? currentTransition : { duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        drag={isMobile ? 'y' : false}
                        dragConstraints={{ top: 0, bottom: 0 }}
                        dragElastic={{ top: 0, bottom: 0.3 }}
                        onDragEnd={handleDragEnd}
                        onClick={handleModalClick}
                        onTouchEnd={handleModalClick}
                        className="relative w-full sm:max-w-[440px] touch-none sm:touch-auto"
                        style={isMobile ? { y: dragY, filter: sheetBlurFilter } : {}}
                    >
                        {/* Outer rim - gradient border */}
                        <div className="p-1 bg-gradient-to-b from-white to-slate-300 rounded-t-[24px] sm:rounded-[24px] shadow-sm">
                            {/* Middle rim - inset track */}
                            <div className="p-1 bg-slate-100 rounded-t-[22px] sm:rounded-[22px] shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]">
                                {/* Inner content card */}
                                <div
                                    className="bg-gradient-to-b from-white to-[#FAFAFA] rounded-t-[20px] sm:rounded-[20px] overflow-hidden border border-white/80 max-h-[85vh] sm:max-h-[80vh] flex flex-col"
                                    style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.06)' }}
                                >
                                    {/* Drag Handle for Mobile */}
                                    <div className="sm:hidden flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing">
                                        <div className="w-10 h-1 bg-slate-300/80 rounded-full shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]" />
                                    </div>

                                    {/* Header */}
                                    <div className="px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between shrink-0">
                                        <div className="flex items-center gap-3">
                                            {/* Icon with knob-in-track style */}
                                            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.08),0_1px_0_rgba(255,255,255,0.8)] bg-white">

                                                <div
                                                    className="w-6 h-6 rounded-lg flex items-center justify-center bg-gradient-to-b from-white to-slate-50 shadow-[0_2px_4px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,1)]"
                                                    style={{ color: 'rgb(36 89 133 / 95%)' }}
                                                >
                                                    <AtomOutline className="w-4 h-4" />

                                                </div>
                                            </div>
                                            <div className="flex flex-col">
                                                <h2 className="text-[15px] sm:text-base font-bold text-slate-800">Custom Instructions</h2>
                                                <span className="text-[10px] text-slate-400">Personalize Zeta's responses</span>
                                            </div>
                                        </div>
                                        {/* Close button - raised soft style */}
                                        <button
                                            onClick={onClose}
                                            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 transition-all bg-slate-50/80 hover:bg-slate-100/80 shadow-[inset_0_1px_1px_rgba(255,255,255,1),0_1px_2px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.02)] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.08)] active:bg-slate-100"
                                        >
                                            <X size={16} strokeWidth={2.5} />
                                        </button>
                                    </div>

                                    {/* Body */}
                                    <div
                                        className="px-5 sm:px-6 pb-5 space-y-4 overflow-y-auto flex-1 touch-auto"
                                        onPointerDownCapture={(e) => e.stopPropagation()}
                                    >
                                        <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">
                                            Share anything you'd like Zeta to know about you or your preferences.
                                        </p>

                                        {/* Textarea with proper inset styling */}
                                        <div className="relative group">
                                            <textarea
                                                value={instructions}
                                                onChange={(e) => setInstructions(e.target.value)}
                                                placeholder="e.g. 'I prefer concise answers', 'Always provide code examples in TypeScript'..."
                                                className="w-full h-36 sm:h-48 p-4 sm:p-5 text-sm bg-slate-50/80 border border-slate-200/60 rounded-2xl focus:outline-none transition-all resize-none text-slate-700 placeholder:text-slate-400 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06),inset_0_1px_2px_rgba(0,0,0,0.04),0_1px_0_rgba(255,255,255,0.8)] focus:shadow-[inset_0_2px_4px_rgba(0,0,0,0.08),0_0_0_2px_rgba(36,89,133,0.15)] focus:border-[rgba(36,89,133,0.3)]"
                                            />
                                            {/* Overlay icon inside textarea */}
                                            <div className="absolute right-3 sm:right-4 bottom-3 sm:bottom-4 pointer-events-none">
                                                <AtomOutline className="w-8 h-8 opacity-10 group-focus-within:opacity-25 transition-opacity" style={{ color: 'rgb(36 89 133)' }} />
                                            </div>
                                        </div>

                                        {/* Info box - raised style with orange color */}
                                        <div
                                            className="flex items-start gap-2 px-3.5 py-2.5 rounded-xl shadow-[0_2px_4px_rgba(251,146,60,0.15),0_1px_2px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.8)] border border-orange-200/60 bg-gradient-to-b from-orange-50 to-orange-100/50"
                                        >
                                            <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 bg-gradient-to-b from-white to-orange-50 shadow-[0_1px_3px_rgba(251,146,60,0.2),inset_0_1px_0_rgba(255,255,255,1)] text-orange-500">
                                                <AlertCircle size={12} />
                                            </div>
                                            <span className="text-[11px] font-medium leading-relaxed text-orange-700/90">
                                                Applied to all new conversations with Zeta and influences behavior matching your preferences.
                                            </span>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="px-5 sm:px-6 py-4 flex justify-end gap-3 shrink-0 border-t border-slate-100/80 bg-slate-50/30">
                                        {/* Cancel button - with outer rim and inset */}
                                        <motion.div
                                            whileTap={{ scale: 0.97 }}
                                            onClick={onClose}
                                            className="cursor-pointer select-none"
                                        >
                                            <div className="p-[2px] rounded-xl bg-gradient-to-b from-white to-slate-300 shadow-[0_2px_6px_rgba(0,0,0,0.1)]">
                                                <div className="p-[1px] rounded-[10px] bg-slate-200/80 shadow-[inset_0_1px_2px_rgba(0,0,0,0.08)]">
                                                    <div className="relative px-4 py-2 rounded-lg bg-gradient-to-b from-white to-slate-50 text-slate-600 hover:text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">
                                                        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/90 to-transparent" />
                                                        <span className="relative z-10 text-[13px] font-semibold">Cancel</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                        {/* Save button - with outer rim and inset, teal color */}
                                        <motion.div
                                            whileTap={{ scale: 0.97 }}
                                            onClick={handleSave}
                                            className={`cursor-pointer select-none ${isSaving ? 'pointer-events-none opacity-70' : ''}`}
                                        >
                                            <div className="p-[2px] rounded-xl bg-gradient-to-b from-[rgb(70,130,180)] to-[rgb(30,75,115)] shadow-[0_2px_6px_rgba(36,89,133,0.25)]">
                                                <div className="p-[1px] rounded-[10px] bg-[rgb(36,89,133)]/50 shadow-[inset_0_1px_2px_rgba(0,0,0,0.08)]">
                                                    <div className="relative px-4 py-2 rounded-lg bg-gradient-to-b from-[rgb(50,110,160)] to-[rgb(36,89,133)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">
                                                        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                                                        <span className="relative z-10 text-[13px] font-semibold flex items-center justify-center gap-2">
                                                            {isSaving ? (
                                                                <>
                                                                    <motion.div
                                                                        animate={{ rotate: 360 }}
                                                                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                                                        className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full"
                                                                    />
                                                                    Saving...
                                                                </>
                                                            ) : 'Save'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
