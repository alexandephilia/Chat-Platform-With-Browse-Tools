import { motion } from 'framer-motion';
import React, { useEffect, useRef } from 'react';

interface ClayInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    icon?: React.ReactElement;
    shortcut?: string;
    containerClassName?: string;
    layoutId?: string;
    isLoading?: boolean;
    onShortcutTrigger?: () => void;
}

export const ClayInput: React.FC<ClayInputProps> = ({
    icon,
    shortcut,
    containerClassName = "",
    layoutId,
    isLoading = false,
    onShortcutTrigger,
    className = "",
    ...props
}) => {
    const inputRef = useRef<HTMLInputElement>(null);

    // Handle keyboard shortcut (⌘/ or Ctrl+/)
    useEffect(() => {
        if (!shortcut) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            // Check for ⌘+/ (Mac) or Ctrl+/ (Windows/Linux)
            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const modifierKey = isMac ? e.metaKey : e.ctrlKey;

            if (modifierKey && e.key === shortcut) {
                e.preventDefault();
                // Focus the input
                inputRef.current?.focus();
                // Call the callback if provided
                onShortcutTrigger?.();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [shortcut, onShortcutTrigger]);

    return (
        <motion.div
            layoutId={layoutId}
            className={`relative group ${containerClassName}`}
        >
            {/* Outer Clay Casing */}
            <div
                className="w-full rounded-[16px] p-[3px] transition-all duration-300"
                style={{
                    background: 'radial-gradient(100% 100% at 50% 0%, rgba(240, 235, 235, 0.8) 0%, rgba(222, 227, 237, 0.6) 100%)',
                    boxShadow: '0 4px 12px -2px rgba(65, 88, 124, 0.27), inset 0 1px 0 rgba(255, 255, 255, 1)'
                }}
            >
                {/* Inner White Input Container */}
                <div className="relative w-full bg-white rounded-[13px] border border-slate-100 flex items-center transition-all duration-200 group-focus-within:border-blue-100 group-focus-within:shadow-[0_2px_8px_rgba(59,130,246,0.05)]">

                    {/* Icon */}
                    {icon && (
                        <div className="pl-3 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                            {React.cloneElement(icon as React.ReactElement<any>, { size: 16 })}
                        </div>
                    )}

                    {/* Input Field */}
                    <input
                        ref={inputRef}
                        className={`w-full bg-transparent border-none outline-none text-sm text-slate-700 placeholder-slate-400 px-3 py-2.5 ${className}`}
                        {...props}
                    />

                    {/* Shortcut KBD - Physical keyboard key style with soft UI */}
                    {shortcut && (
                        <div className="pr-3 hidden sm:flex items-center">
                            <kbd
                                className="inline-flex h-[22px] items-center justify-center gap-1 rounded-[5px] px-2 font-mono font-medium text-slate-500 bg-gradient-to-b from-slate-50 via-slate-100 to-slate-200 border border-slate-300/80 shadow-[0_2px_0_0_rgb(203,213,225),0_3px_3px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.9)]"
                                title={`Press ⌘${shortcut} to focus`}
                            >
                                <span className="text-[13px] leading-none">⌘</span>
                                <span className="text-[12px] leading-none">{shortcut}</span>
                            </kbd>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};
