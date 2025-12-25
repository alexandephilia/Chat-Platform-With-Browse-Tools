import React from 'react';

interface StatusPillProps {
    children: React.ReactNode;
    variant: 'free' | 'pro';
    className?: string;
}

export const StatusPill: React.FC<StatusPillProps> = ({
    children,
    variant,
    className = ''
}) => {
    const variantStyles = {
        free: {
            bg: 'bg-gradient-to-r from-blue-400 via-blue-300 to-blue-400',
            glow: 'from-blue-400/20 via-blue-300/20 to-blue-400/20',
            shadow: 'shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),inset_0_-1px_2px_rgba(59,130,246,0.1),0_2px_6px_rgba(59,130,246,0.4)]'
        },
        pro: {
            bg: 'bg-gradient-to-r from-orange-400 via-orange-300 to-orange-400',
            glow: 'from-orange-400/20 via-orange-300/20 to-orange-400/20',
            shadow: 'shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),inset_0_-1px_2px_rgba(251,146,60,0.1),0_2px_6px_rgba(251,146,60,0.4)]'
        }
    };

    const currentVariant = variantStyles[variant];

    return (
        <span
            className={`
                relative inline-flex items-center
                px-1 py-0.5 text-[6px] font-bold uppercase tracking-wider
                rounded-full text-white
                ${currentVariant.bg}
                ${currentVariant.shadow}
                ${className}
            `}
        >
            {/* Outer glow */}
            <span
                className={`
                    absolute inset-0 rounded-full bg-gradient-to-r
                    ${currentVariant.glow}
                    blur-sm
                `}
            />

            {/* Top highlight for embossed effect */}
            <span className="absolute inset-x-1 top-0 h-[0.5px] bg-gradient-to-r from-transparent via-white/60 to-transparent rounded-full" />

            {/* Content */}
            <span className="relative">{children}</span>

            {/* Bottom shadow for embossed effect */}
            <span className="absolute inset-x-1 bottom-0 h-[0.5px] bg-gradient-to-r from-transparent via-black/10 to-transparent rounded-full" />
        </span>
    );
};

export default StatusPill;
