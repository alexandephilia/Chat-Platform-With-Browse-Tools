import { motion } from "framer-motion";
import React from "react";

interface ClayButtonProps {
    onClick?: () => void;
    icon?: React.ReactNode;
    label: string;
    className?: string;
}

export const ClayButton: React.FC<ClayButtonProps> = ({
    onClick,
    icon,
    label,
    className = "",
}) => {
    return (
        <motion.button
            onClick={onClick}
            whileHover="hover"
            whileTap={{ scale: 0.95 }}
            className={`relative group px-5 py-3 rounded-full overflow-hidden ${className}`}
        >
            {/* 1. Base Background & Border Container */}
            <div className="absolute inset-0 bg-slate-100 rounded-full" />

            {/* 2. Top Shine (Left to Right) */}
            <motion.div
                className="absolute top-0 left-0 h-[80%] w-full bg-gradient-to-r from-transparent via-blue-200 to-transparent"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{
                    repeat: Infinity,
                    duration: 3,
                    ease: "linear",
                }}
            />

            {/* 3. Bottom Shine (Right to Left) */}
            <motion.div
                className="absolute bottom-0 right-0 h-[80%] w-full bg-gradient-to-r from-transparent via-blue-200 to-transparent"
                initial={{ x: "100%" }}
                animate={{ x: "-100%" }}
                transition={{
                    repeat: Infinity,
                    duration: 3,
                    ease: "linear",
                }}
            />

            {/* 4. Claymorphism Surface (Inner) */}
            {/* We create a slightly smaller container to mimic the 'border' thickness of 2px effectively masked by the shines above */}
            <div className="absolute inset-[2px] bg-white rounded-full flex items-center justify-center transition-all duration-300">
                {/* Clay Shadows: Inset highlights and shadows to create volume */}
                <div className="absolute inset-0 rounded-full shadow-[inset_-2px_-2px_6px_rgba(0,0,0,0.05),inset_2px_2px_6px_rgba(255,255,255,1)]" />

                {/* Active/Hover State Overlay */}
                <div className="absolute inset-0 rounded-full bg-blue-50/0 group-hover:bg-blue-50/30 transition-colors duration-300" />
            </div>

            {/* 5. Content */}
            <div className="relative z-10 flex items-center space-x-2 text-slate-500 font-medium ">
                {icon && <span className="text-current">{icon}</span>}
                <span className="text-xs">{label}</span>
            </div>
        </motion.button>
    );
};

export default ClayButton;
