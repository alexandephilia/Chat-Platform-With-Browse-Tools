import { motion } from 'framer-motion';
import React from 'react';

interface ClayInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    icon?: React.ReactElement;
    shortcut?: string;
    containerClassName?: string;
    layoutId?: string;
    isLoading?: boolean;
}

export const ClayInput: React.FC<ClayInputProps> = ({
    icon,
    shortcut,
    containerClassName = "",
    layoutId,
    isLoading = false,
    className = "",
    ...props
}) => {
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
                        className={`w-full bg-transparent border-none outline-none text-sm text-slate-700 placeholder-slate-400 px-3 py-2.5 ${className}`}
                        {...props}
                    />

                    {/* Shortcut KBD */}
                    {shortcut && (
                        <div className="pr-3 flex items-center">
                            <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-slate-200 bg-slate-50 px-1.5 font-mono text-[10px] font-medium text-slate-500 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
                                <span className="text-xs">⌘</span> {shortcut}
                            </kbd>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};
