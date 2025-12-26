import { motion } from "framer-motion";
import React from "react";

interface ClayPillProps {
    children: React.ReactNode;
    className?: string;
    size?: "xs" | "sm" | "md" | "lg";
    variant?: "primary" | "secondary" | "accent" | "deepBlue";
    onClick?: () => void;
}

export const ClayPill: React.FC<ClayPillProps> = ({
    children,
    className = "",
    size = "md",
    variant = "primary",
    onClick,
}) => {
    const sizeClasses = {
        xs: "px-1.5 py-0.5 text-[8px]",
        sm: "px-2 py-0.5 text-[10px]",
        md: "px-3 py-1 text-xs",
        lg: "px-4 py-1.5 text-sm",
    };

    const variantClasses = {
        primary: "from-blue-500 via-blue-400 to-blue-500",
        secondary: "from-slate-500 via-slate-400 to-slate-500",
        accent: "from-purple-500 via-pink-400 to-purple-500",
        deepBlue: "from-blue-600 via-blue-500 to-indigo-600",
    };

    return (
        <motion.span
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={onClick}
            className={`
                relative inline-flex items-center font-semibold rounded-full p-[2px]
                ${onClick ? 'cursor-pointer' : ''}
                ${className}
            `}
        >
            {/* Outer glow */}
            <span className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/30 via-purple-400/30 to-blue-400/30 blur-md" />

            {/* Animated border shine - rotating conic gradient */}
            <span className="absolute inset-0 rounded-full overflow-hidden">
                <motion.span
                    className="absolute inset-[-100%] bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,rgba(255,255,255,0.8)_60deg,transparent_120deg)]"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    style={{ width: '300%', height: '300%', left: '-100%', top: '-100%' }}
                />
            </span>

            {/* Claymorphism base with gradient */}
            <span
                className={`
                    relative z-10 inline-flex items-center gap-1.5 rounded-full
                    bg-gradient-to-r ${variantClasses[variant]}
                    text-white font-semibold tracking-wide
                    ${sizeClasses[size]}
                    shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),inset_0_-2px_4px_rgba(0,0,0,0.1),0_4px_12px_rgba(59,130,246,0.3)]
                `}
            >
                {/* Top highlight for embossed effect */}
                <span className="absolute inset-x-2 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent rounded-full" />

                {/* Content */}
                <span className="relative">{children}</span>

                {/* Bottom shadow for embossed effect */}
                <span className="absolute inset-x-2 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-black/10 to-transparent rounded-full" />
            </span>
        </motion.span>
    );
};

// Small badge variant for "Beta", "New", etc.
interface BadgePillProps {
    children: React.ReactNode;
    className?: string;
}

export const BadgePill: React.FC<BadgePillProps> = ({ children, className = "" }) => {
    return (
        <span
            className={`
                relative inline-flex items-center ml-1
                px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider
                rounded-full
                bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400
                text-white
                shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),inset_0_-1px_2px_rgba(0,0,0,0.1),0_2px_6px_rgba(251,146,60,0.4)]
                ${className}
            `}
        >
            <span className="absolute inset-x-1 top-0 h-[0.5px] bg-gradient-to-r from-transparent via-white/60 to-transparent rounded-full" />
            {children}
        </span>
    );
};

export default ClayPill;
