import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import React from 'react';

interface ClayCardProps {
    title: string;
    description: string;
    icon?: LucideIcon;
    onClick?: () => void;
    className?: string;
}

export const ClayCard: React.FC<ClayCardProps> = ({ title, description, icon: Icon, onClick, className = "" }) => {
    return (
        <motion.button
            onClick={onClick}
            whileHover={{
                scale: 1.02,
                transition: { type: "spring", stiffness: 400, damping: 25 }
            }}
            whileTap={{ scale: 0.98 }}
            className={`relative group w-full text-left transition-all duration-200 ease-out focus:outline-none ${className}`}
        >
            {/* Outer Casing (The "Clay" Shell) */}
            <div
                className="w-full h-full rounded-[20px] p-[5px] backdrop-blur-[25px] transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1"
                style={{
                    background: 'radial-gradient(144.11% 100% at 50% 0%, rgba(247, 249, 250, 0.99) 0%, rgba(234, 236, 241, 0.8) 100%)',
                    boxShadow: '0 8px 10px rgba(0, 0, 0, 0.13), 0 4px 4px rgba(0, 0, 0, 0.05)'
                }}
            >
                {/* Inner White Card */}
                <div
                    className="relative w-full h-full bg-white rounded-2xl p-5 border border-[rgba(0,0,0,0.05)] transition-all duration-300 group-hover:border-[rgba(0,0,0,0.08)] group-hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.12)] flex flex-col justify-between overflow-hidden"
                    style={{
                        boxShadow: '0 8px 10px rgba(0, 0, 0, 0.13), 0 4px 4px rgba(0, 0, 0, 0.05)'
                    }}
                >
                    {/* Watermark Icon - Non-generic placement */}
                    {Icon && (
                        <div className="absolute -bottom-4 -right-4 text-slate-900/[0.03] transform rotate-[-15deg] transition-all duration-500 group-hover:scale-110 group-hover:rotate-[-5deg] group-hover:text-slate-900/[0.05] pointer-events-none z-0">
                            <Icon size={120} strokeWidth={1.5} />
                        </div>
                    )}

                    <div className="relative z-10">
                        <h3 className="text-xl font-display text-slate-800 mb-1 flex items-center gap-2">
                           {title}
                        </h3>
                        <p className="text-xs text-slate-400 font-medium leading-relaxed">{description}</p>
                    </div>
                </div>
            </div>
        </motion.button>
    );
};
