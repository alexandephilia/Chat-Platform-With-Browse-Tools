import { motion } from "framer-motion";
import React from "react";

export const WelcomeBackground: React.FC = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 overflow-hidden pointer-events-none"
        >
            {/* Background Image - Fixed size to prevent resize shifting */}
            <div
                className="absolute inset-0 blur-[3px] brightness-125"
                style={{
                    backgroundImage: `url("/images/background.jpg")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center center',
                    backgroundSize: 'cover',
                    minWidth: '100%',
                    minHeight: '100%',
                }}
            />

            {/* Multi-layered gradient for that "Half Fade Out" look */}
            {/* 1. Base softening gradient - hits white/60 at the middle (50%) */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/60 via-50% to-white/100" />

            {/* 2. Top-down vignette for subtle header contrast */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-transparent" />
        </motion.div>
    );
};
