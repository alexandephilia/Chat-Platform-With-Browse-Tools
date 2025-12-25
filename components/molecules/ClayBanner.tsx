import { motion } from 'framer-motion';
import React from 'react';

interface ClayBannerProps {
    title: string;
    description: React.ReactNode;
    icon?: React.ReactNode;
    action?: React.ReactNode;
    className?: string;
    variant?: 'blue' | 'purple' | 'neutral';
}

export const ClayBanner: React.FC<ClayBannerProps> = ({ 
    title, 
    description, 
    icon, 
    action, 
    className = "",
    variant = 'blue'
}) => {
    // Complimentary background elements based on variant
    const getBgElement = () => {
        switch (variant) {
            case 'purple':
                return "bg-gradient-to-br from-purple-50 to-purple-100/50";
            case 'neutral':
                 return "bg-gradient-to-br from-slate-50 to-slate-100/50";
            case 'blue':
            default:
                return "bg-gradient-to-br from-blue-50 to-blue-100/50";
        }
    };

    return (
        <div className={`relative group w-full text-left ${className}`}>
             {/* Outer Casing (The "Clay" Shell) */}
             <div 
                className="w-full rounded-[24px] p-[5px] backdrop-blur-[25px] transition-shadow duration-300"
                style={{
                    background: 'radial-gradient(144.11% 100% at 50% 0%, rgba(247, 249, 250, 0.99) 0%, rgba(234, 236, 241, 0.8) 100%)',
                    boxShadow: 'rgba(255, 255, 255, 0.85) 0px 1.5px 0px 0px inset, rgba(0, 0, 0, 0.09) 0px 1px 3px 0px'
                }}
            >
                {/* Inner White Card */}
                <div 
                    className="w-full bg-white rounded-[20px] p-4 border border-[rgba(0,0,0,0.05)] relative overflow-hidden flex flex-col gap-3"
                    style={{
                        boxShadow: 'rgba(0, 0, 0, 0.06) 0px 4px 8px 0px'
                    }}
                >
                    {/* Complimentary Decorative BG Element */}
                    <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl opacity-60 -mr-10 -mt-10 pointer-events-none transition-transform duration-700 group-hover:scale-110 ${getBgElement()}`} />
                    
                    {/* Content Layer */}
                    <div className="relative z-10">
                        {/* Header: Icon + Title */}
                        <div className="flex items-center gap-3 mb-2">
                             {icon && (
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-500 to-blue-600 shadow-blue-200 shadow-lg flex items-center justify-center text-white">
                                    {icon}
                                </div>
                             )}
                             <h4 className="font-bold text-slate-800 text-sm leading-tight">{title}</h4>
                        </div>

                        {/* Description */}
                        <div className="text-[11px] text-slate-500 font-medium leading-relaxed">
                            {description}
                        </div>

                        {/* Action Button */}
                        {action && (
                            <div className="mt-3">
                                {action}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
