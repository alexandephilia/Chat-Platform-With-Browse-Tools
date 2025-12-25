import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, AlertCircle } from 'lucide-react';

interface CustomInstructionsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CustomInstructionsModal: React.FC<CustomInstructionsModalProps> = ({ isOpen, onClose }) => {
    const [instructions, setInstructions] = useState('');
    const [isSaving, setIsSaving] = useState(false);

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

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-lg bg-[var(--color-background)] rounded-[32px] shadow-2xl overflow-hidden border border-[var(--color-border-light)]"
                    >
                        {/* Header */}
                        <div className="p-8 pb-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                                    <Sparkles size={20} />
                                </div>
                                <h2 className="text-xl font-bold text-[var(--color-text)]">Custom Instructions</h2>
                            </div>
                            <button 
                                onClick={onClose}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-[var(--color-text-secondary)] transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-8 pt-0 space-y-6">
                            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                                Share anything you'd like Zeta to know about you or your preferences. This helps the AI provide more personalized and relevant responses.
                            </p>

                            <div className="relative group">
                                <textarea
                                    value={instructions}
                                    onChange={(e) => setInstructions(e.target.value)}
                                    placeholder="e.g. 'I prefer concise answers', 'Always provide code examples in TypeScript'..."
                                    className="w-full h-48 p-5 text-sm bg-[var(--color-input)] border border-[var(--color-border-light)] rounded-2xl focus:outline-none focus:ring-4 focus:ring-[var(--color-primary)]/10 transition-all resize-none text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]"
                                />
                                <div className="absolute right-4 bottom-4 pointer-events-none opacity-20 group-focus-within:opacity-40 transition-opacity">
                                    <Sparkles size={40} className="text-[var(--color-primary)]" />
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-4 bg-blue-50/50 dark:bg-blue-900/20 rounded-2xl border border-blue-100/50 dark:border-blue-800/50">
                                <AlertCircle size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
                                <p className="text-[11px] text-blue-600/80 dark:text-blue-400/80 leading-normal">
                                    These instructions will be applied to all new conversations you start with Zeta.
                                </p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 bg-slate-50/50 dark:bg-slate-900/50 border-t border-[var(--color-border-light)] flex justify-end gap-3">
                            <button
                                onClick={onClose}
                                className="px-6 py-2.5 text-sm font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className={`px-8 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-bold shadow-lg shadow-[var(--color-primary)]/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 ${isSaving ? 'opacity-70 cursor-wait' : ''}`}
                            >
                                {isSaving ? (
                                    <>
                                        <motion.div 
                                            animate={{ rotate: 360 }}
                                            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                                        />
                                        Saving...
                                    </>
                                ) : 'Save changes'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
