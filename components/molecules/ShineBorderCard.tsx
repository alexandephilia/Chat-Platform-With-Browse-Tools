import { motion } from "framer-motion";
import React from "react";

interface ShineBorderCardProps {
    title: string;
    description: string;
    onClick?: () => void;
    className?: string;
}

export const ShineBorderCard: React.FC<ShineBorderCardProps> = ({
    title,
    description,
    onClick,
    className = "",
}) => {
    return (
        <motion.button
            onClick={onClick}
            whileHover={{ scale: 1.02, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
            whileTap={{ scale: 0.98 }}
            initial="initial"
            className={`relative group rounded-[20px] p-[1px] overflow-hidden text-left focus:outline-none transition-all duration-300 ${className}`}
        >
            {/* 1. Static Border (Default state) */}
            <div className="absolute inset-0 bg-slate-100 rounded-[20px]" />

            {/* 2. Animated Shine Gradient (Always Visible) */}
            <motion.div
                className="absolute inset-[-100%] bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,transparent_90deg,#60A5FA_180deg,transparent_270deg,transparent_360deg)] opacity-100"
                style={{
                    animation: "spin 4s linear infinite",
                }}
            />

            {/* 3. Inner Card Content */}
            <div className="relative h-full bg-gradient-to-br from-white via-[#fafafa] to-slate-50 group-hover:from-white group-hover:to-white rounded-[19px] p-5 transition-all duration-200">
                <h3 className="font-semibold text-slate-800 text-sm mb-2">
                    {title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                    {description}
                </p>
            </div>

            {/* Tailwind Keyframe Injection for 'spin' if not present in config usually needs standard spin class */}
            <style jsx>{`
                @keyframes spin {
                    from {
                        transform: rotate(0deg);
                    }
                    to {
                        transform: rotate(360deg);
                    }
                }
            `}</style>
        </motion.button>
    );
};

export default ShineBorderCard;
