import { motion } from "framer-motion";
import React from "react";

interface InfoPillProps {
    children: React.ReactNode;
    className?: string;
    variant?: "blue" | "accent" | "slate" | "white";
    size?: "xxs" | "xs" | "sm";
}

export const InfoPill: React.FC<InfoPillProps> = ({
    children,
    className = "",
    variant = "blue",
    size = "sm",
}) => {
    const variantClasses = {
        white: {
            bg: "bg-white",
            text: "text-slate-500",
            border: "border-slate-200",
            shadow: "shadow-[inset_0_2px_4px_rgba(0,0,0,0.06),inset_0_0_0_1px_rgba(241,245,249,1),0_1px_0_rgba(255,255,255,1)]",
            glow: "from-slate-200/50 to-transparent"
        },
        blue: {
            bg: "from-blue-100/50 via-blue-200/40 to-indigo-100/50",
            text: "from-blue-700 via-blue-600 to-indigo-700",
            border: "border-blue-200/50",
            shadow: "shadow-blue-500/10",
            glow: "from-blue-400/20 via-sky-400/10 to-transparent"
        }
    };

    const currentVariant = variant === 'blue' ? variantClasses.blue : variantClasses.white;
    const isGradientText = variant === 'blue';

    return (
        <motion.div
            initial={{ scale: 0.9, opacity: 0, x: -10 }}
            animate={{ scale: 1, opacity: 1, x: 0 }}
            className={`relative inline-flex items-center group select-none ${className}`}
        >
            {/* The Main Body: Unique Geometric Shape */}
            <div className="relative z-10">
                {/* Layer 1: The Base */}
                <div className={`
                    absolute inset-0
                    rounded-[10px]
                    ${currentVariant.bg}
                    ${currentVariant.border ? `border ${currentVariant.border}` : ''}
                    ${currentVariant.shadow}
                `} />

                {/* Layer 2: Inner Content Wrapper */}
                <div className={`
                    relative flex items-center gap-1.5 z-20 font-bold
                    ${size === 'xxs' ? 'px-1.5 py-[1px]' : size === 'xs' ? 'px-2 py-0.5' : 'px-2.5 py-1'}
                `}>

                    {/* Text with Shimmer */}
                    <motion.span
                        className={`
                            ${size === 'xxs' ? 'text-[8px]' : size === 'xs' ? 'text-[9px]' : 'text-[10px]'}
                            tracking-wide uppercase
                            bg-clip-text text-transparent
                        `}
                        style={{
                            backgroundImage: variant === 'white'
                                ? "linear-gradient(110deg, #313b49ff 0%, #313b49ff 40%, #b3bcc8ff 50%, #313b49ff 60%, #313b49ff 100%)"
                                : `linear-gradient(90deg, ${variantClasses.blue.text.replace('text-', '')})`,
                            backgroundSize: "200% auto",
                        }}
                        animate={{
                            backgroundPosition: ["80% center", "-80% center"],
                        }}
                        transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                    >
                        {children}
                    </motion.span>
                </div>
            </div>
        </motion.div>
    );
};

export default InfoPill;
