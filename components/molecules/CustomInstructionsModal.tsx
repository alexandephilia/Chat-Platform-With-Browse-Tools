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
                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-b from-white to-slate-50 flex items-center justify-center text-blue-500 shadow-[0_8px_16px_-4px_rgba(0,0,0,0.12),0_4px_8px_-2px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,1),0_0_0_1px_rgba(0,0,0,0.02)] border border-transparent">
                                    <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.1),inset_0_1px_1px_rgba(0,0,0,0.05),0_1px_0_rgba(255,255,255,1)]">
                                        <Sparkles size={16} className="text-blue-500" />
                                    </div>
                                </div>
                                <h2 className="text-xl font-bold text-slate-800">Custom Instructions</h2>
                            </div>
                            <button 
                                onClick={onClose}
                                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-8 pt-0 space-y-6">
                            <p className="text-sm text-slate-500 leading-relaxed">
                                Share anything you'd like Zeta to know about you or your preferences. This helps the AI provide more personalized and relevant responses.
                            </p>

                            <div className="relative group">
                                <textarea
                                    value={instructions}
                                    onChange={(e) => setInstructions(e.target.value)}
                                    placeholder="e.g. 'I prefer concise answers', 'Always provide code examples in TypeScript'..."
                                    className="w-full h-48 p-5 text-sm bg-slate-50 border border-slate-200/60 rounded-2xl focus:outline-none transition-all resize-none text-slate-700 placeholder:text-slate-400 shadow-[inset_0_6px_10px_rgba(0,0,0,0.1),inset_0_-1px_1px_rgba(255,255,255,0.8)] focus:shadow-[inset_0_8px_16px_rgba(0,0,0,0.12),inset_0_2px_4px_rgba(0,0,0,0.05),inset_0_-1px_1px_rgba(255,255,255,0.8)]"
                                />
                                <div className="absolute right-4 bottom-4 pointer-events-none opacity-20 group-focus-within:opacity-40 transition-opacity">
                                    <Sparkles size={40} className="text-blue-500/40" />
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                                <AlertCircle size={18} className="text-blue-400 flex-shrink-0 mt-0.5" />
                                <p className="text-[11px] text-blue-500/70 leading-normal">
                                    These instructions will be applied to all new conversations you start with Zeta.
                                </p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-4">
                            <button
                                onClick={onClose}
                                className="px-6 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                            >
                                Cancel
                            </button>
                            
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleSave}
                                disabled={isSaving}
                                className={`
                                    relative px-8 py-2.5 rounded-xl text-white text-sm font-bold overflow-hidden
                                    bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600
                                    shadow-[0_4px_12px_rgba(37,99,235,0.25),inset_0_2px_4px_rgba(255,255,255,0.3),inset_0_-2px_4px_rgba(0,0,0,0.1)]
                                    flex items-center gap-2 min-w-[140px] justify-center
                                    ${isSaving ? 'opacity-70 cursor-wait' : ''}
                                `}
                            >
                                {/* Top highlight for claymorphism */}
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
